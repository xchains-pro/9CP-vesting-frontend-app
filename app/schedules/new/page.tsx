"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { waitForTransaction } from "@wagmi/core"
import { ConnectKitButton } from "connectkit"
import { format, getUnixTime } from "date-fns"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { createPublicClient, getContract, http, parseUnits } from "viem"
import { Chain, useAccount } from "wagmi"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { env } from "@/env.mjs"
import { cn, getChain } from "@/lib/utils"
import { abi } from "@/lib/vestingAbi"
import { writeTokenVesting } from "@/wagmi/generated"

const formSchema = z
  .object({
    beneficiary: z
      .string()
      .min(42, {
        message: "Ethereum address is too short",
      })
      .startsWith("0x", {
        message: "Ethereum address must start with 0x",
      }),
    amount: z.coerce.number().positive().min(0, {
      message: "Amount must be greater than 0",
    }),
    start: z.date({
      required_error: "A start date is required",
    }),
    end: z.date({
      required_error: "An end date is required",
    }),
    cliffMonths: z.coerce.number().int(),
    revokable: z.boolean(),
  })
  .refine((data) => data.end > data.start, {
    message: "End date cannot be earlier or the same as the start date.",
    path: ["end"],
  })

const chain: Chain = getChain(Number(env.NEXT_PUBLIC_CHAIN_ID))

const client = createPublicClient({
  chain: chain,
  transport: http(
    `${chain.rpcUrls.alchemy.http[0]}/${env.NEXT_PUBLIC_ALCHEMY_KEY}`
  ),
})

const vestingContract = getContract({
  address: env.NEXT_PUBLIC_VESTING_CONTRACT as `0x${string}`,
  abi: abi,
  publicClient: client,
})

export default function Page() {
  const [isCreating, setIsCreating] = useState(false)
  const [cliffSeconds, setCliffSeconds] = useState<number>(0)
  const [startTimestamp, setStartTimestamp] = useState<number>(0)
  const [endTimestamp, setEndTimestamp] = useState<number>(0)
  const [formattedAmount, setFormattedAmount] = useState<bigint>(0n)
  const { isConnected, address } = useAccount()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiary: "",
      amount: 0,
      cliffMonths: 0,
      revokable: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCreating(true)

    if (cliffSeconds > endTimestamp - startTimestamp) {
      toast.error(
        "Cliff duration is longer than the total vesting period. Please adjust the cliff or end date and try again."
      )
      setIsCreating(false)
      return
    }

    const availableTokens = await vestingContract.read.getWithdrawableAmount()
    if (formattedAmount > availableTokens) {
      toast.error(
        "Not enough tokens available to create this schedule. Send more tokens to the contract and try again."
      )
      setIsCreating(false)
      return
    }

    try {
      const { hash } = await writeTokenVesting({
        functionName: "createVestingSchedule",
        args: [
          values.beneficiary as `0x${string}`,
          BigInt(startTimestamp as number),
          BigInt(cliffSeconds as number),
          BigInt((endTimestamp - startTimestamp) as number),
          BigInt(1),
          values.revokable as boolean,
          formattedAmount,
        ],
        mode: "prepared",
      })
      await waitForTransaction({
        hash,
      })
      setIsCreating(false)
      toast.success("Successfully created schedule")
    } catch (e) {
      setIsCreating(false)
      toast.error("Failed to create schedule")
    }
  }

  const amount = form.watch("amount")
  const start = form.watch("start")
  const end = form.watch("end")
  const cliff = form.watch("cliffMonths")

  useEffect(() => {
    if (amount) {
      let amt = amount.toString() as `${number}`
      setFormattedAmount(parseUnits(amt, 18))
    }
  }, [amount])

  useEffect(() => {
    if (start) {
      setStartTimestamp(getUnixTime(start))
    }
  }, [start])

  useEffect(() => {
    if (end) {
      setEndTimestamp(getUnixTime(end))
    }
  }, [end])

  useEffect(() => {
    if (cliff) {
      setCliffSeconds(cliff * 2629746) // months to seconds
    }
  }, [cliff])

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        Create Vesting Schedule
      </h1>
      <div className="rounded-lg border border-slate-300 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="beneficiary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiary</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Ethereum address of the vesting schedule beneficiary.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Amount</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Start date of the vesting schedule. This date can also be in
                    the past.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    End date of the vesting schedule.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cliffMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliff in months</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormDescription>
                    Tokens are only released after the cliff period.{" "}
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger>
                          {" "}
                          <b>
                            The cliff is included in the total vesting period.
                          </b>
                        </TooltipTrigger>
                        <TooltipContent className="w-96	">
                          Example: The schedule starts at 1/1/2024 and ends at
                          1/1/2028. The cliff is supposed to be 12 months.{" "}
                          <br /> <br />
                          This means that the beneficiary can do their first
                          token claim on 1/1/2025, when the cliff has ended.
                          Then the schedule will run for another 3 years, until
                          1/1/2028.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="revokable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Revokable</FormLabel>
                    <FormDescription>
                      Can the vesting schedule be revoked?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isConnected && address ? (
              <Button type="submit" disabled={isCreating}>
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Schedule
              </Button>
            ) : (
              <ConnectKitButton.Custom>
                {({ show }) => {
                  return (
                    <Button type="button" onClick={show}>
                      Connect Wallet
                    </Button>
                  )
                }}
              </ConnectKitButton.Custom>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
