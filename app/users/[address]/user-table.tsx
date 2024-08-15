"use client"

import { waitForTransaction } from "@wagmi/core"
import { ConnectKitButton } from "connectkit"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import toast from "react-hot-toast"
import { formatEther } from "viem"
import { useAccount } from "wagmi"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CliffTableCell } from "@/components/ui/cliff-table-cell"
import { EndTableCell } from "@/components/ui/end-table-cell"
import { StartTableCell } from "@/components/ui/start-table-cell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProcessedSchedule } from "@/types/schedule"
import { writeTokenVesting } from "@/wagmi/generated"

export function UserTable({ schedules }: { schedules: ProcessedSchedule[] }) {
  const { isConnected, address } = useAccount()
  const [isReleasingSingle, setIsReleasingSingle] = useState(false)
  const [isReleasingAll, setIsReleasingAll] = useState(false)

  async function releaseTokensSingle(schedule: ProcessedSchedule) {
    setIsReleasingSingle(true)
    try {
      const { hash } = await writeTokenVesting({
        functionName: "release",
        args: [
          schedule.id as `0x${string}`,
          schedule.releasableAmount as bigint,
        ],
        mode: "prepared",
      })
      await waitForTransaction({
        hash,
      })
      setIsReleasingSingle(false)
      toast.success("Successfully released tokens")
      await fetch(`/api/revalidate/${address}`)
    } catch (err) {
      setIsReleasingSingle(false)
      toast.error("Failed to release tokens")
    }
  }

  async function releaseTokensAll() {
    setIsReleasingAll(true)
    try {
      const { hash } = await writeTokenVesting({
        functionName: "releaseAvailableTokensForHolder",
        args: [address as `0x${string}`],
        mode: "prepared",
      })
      await waitForTransaction({
        hash,
      })
      setIsReleasingAll(false)
      toast.success("Successfully released tokens")
      await fetch(`/api/revalidate/${address}`)
    } catch (err) {
      setIsReleasingAll(false)
      toast.error("Failed to release tokens")
    }
  }

  return (
    <>
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Is this you?</CardTitle>
            <CardDescription>
              Connect your wallet to release tokens from the vesting contract.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <ConnectKitButton.Custom>
              {({ show }) => {
                return <Button onClick={show}>Connect Wallet</Button>
              }}
            </ConnectKitButton.Custom>
          </CardFooter>
        </Card>
      )}

      {isConnected && address == schedules[0].beneficiary && (
        <Card>
          <CardHeader>
            <CardTitle>Release all tokens</CardTitle>
            <CardDescription>
              Release available tokens from all your vesting schedules in one
              single transaction.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button size="sm" onClick={() => releaseTokensAll()}>
              {isReleasingAll && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Release All
            </Button>
          </CardFooter>
        </Card>
      )}

      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Total Token Amount</TableHead>
            <TableHead className="w-[140px]">Start</TableHead>
            <TableHead className="w-[140px]">Cliff End</TableHead>
            <TableHead className="w-[140px]">End</TableHead>
            <TableHead>Released Tokens</TableHead>
            <TableHead>Releasable Tokens</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule, index) => (
            <TableRow key={index}>
              <TableCell>
                <span>
                  {new Intl.NumberFormat(undefined, {
                    maximumFractionDigits: 2,
                  }).format(
                    Number(formatEther(schedule.amountTotal as bigint))
                  )}
                </span>

                {schedule.status == 1 && (
                  <Badge className="ml-2" variant="destructive">
                    Revoked
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <StartTableCell schedule={schedule} />
              </TableCell>
              <TableCell>
                <CliffTableCell schedule={schedule} />
              </TableCell>
              <TableCell>
                <EndTableCell schedule={schedule} />
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat(undefined, {
                  maximumFractionDigits: 2,
                }).format(Number(formatEther(schedule.released as bigint)))}
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat(undefined, {
                  maximumFractionDigits: 2,
                }).format(
                  Number(formatEther(schedule.releasableAmount as bigint))
                )}
              </TableCell>
              <TableCell className="float-right">
                <div className="flex gap-1">
                  <Link
                    href={`/users/${schedule.beneficiary}`}
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                  >
                    Details
                  </Link>
                  {isConnected &&
                    address == schedule.beneficiary &&
                    Number(schedule.releasableAmount) > 0 && (
                      <Button
                        size="sm"
                        onClick={() => releaseTokensSingle(schedule)}
                      >
                        {isReleasingSingle && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Release
                      </Button>
                    )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
