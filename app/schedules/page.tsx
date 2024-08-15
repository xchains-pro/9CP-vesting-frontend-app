import { SortingState } from "@tanstack/react-table"
import type { Metadata } from "next"
import { createPublicClient, formatEther, getContract, http } from "viem"
import { normalize } from "viem/ens"
import { Chain } from "wagmi"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { env } from "@/env.mjs"
import { getChain } from "@/lib/utils"
import { abi } from "@/lib/vestingAbi"
import { ProcessedSchedule, Schedule } from "@/types/schedule"

import { columns } from "./columns"

const chain: Chain = getChain(Number(env.NEXT_PUBLIC_CHAIN_ID))

const client = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: chain,
  transport: http(
    `${chain.rpcUrls.alchemy.http[0]}/${env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    { retryCount: 5 }
  ),
})

export const metadata: Metadata = {
  title: "All Schedules",
}

export const revalidate = 60 * 60 * 1 // revalidate every hour

export default async function Page() {
  let schedules: ProcessedSchedule[] = []

  const vestingContract = getContract({
    address: env.NEXT_PUBLIC_VESTING_CONTRACT as `0x${string}`,
    abi: abi,
    publicClient: client,
  })

  const vTokenSymbol = await vestingContract.read.symbol()
  const totalLockedTokens = await vestingContract.read.totalSupply()
  let totalReleasableTokens: bigint = BigInt(0)
  let totalReleasedTokens: bigint = BigInt(0)
  const scheduleIds = await vestingContract.read.getVestingSchedulesIds()
  let numRevokedSchedules = 0

  console.log("scheduleIds total:", scheduleIds.length)

  for (let i = 0; i < scheduleIds.length; i++) {
    const schedule: Schedule = await vestingContract.read.getVestingSchedule([
      scheduleIds[i] as `0x${string}`,
    ])
    console.log("-----")
    console.log("schedule request:", i + 1)

    let released: bigint = schedule.released as bigint
    totalReleasedTokens += released

    let releasableAmount = BigInt(0)
    if (schedule.status == 0) {
      console.log("schedule amount request:", i + 1)
      releasableAmount = await vestingContract.read.computeReleasableAmount([
        scheduleIds[i],
      ])
      totalReleasableTokens += releasableAmount
    } else {
      numRevokedSchedules++
    }

    let ensName = null
    let avatar = null

    // Only get ENS name for mainnet
    if (chain.id == 1) {
      console.log("ens name request:", i + 1)
      ensName = await client.getEnsName({
        address: schedule.beneficiary as `0x${string}`,
      })

      if (ensName) {
        console.log("ens avatar request:", i + 1)
        const ensText = await client.getEnsAvatar({
          name: normalize(ensName),
        })
        avatar = ensText as string
      }
    }

    schedules.push({
      ...schedule,
      ...{ id: scheduleIds[i], releasableAmount, ensName, ensAvatar: avatar },
    })
  }

  const sortingState: SortingState = [{ id: "Total Token Amount", desc: true }]

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        All Schedules
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Tokens</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="text-muted-foreground h-4 w-4"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 2,
              }).format(Number(formatEther(totalLockedTokens as bigint)))}
            </div>
            <p className="text-muted-foreground text-xs">{vTokenSymbol}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Number of Schedules
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="text-muted-foreground h-4 w-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleIds.length}</div>
            <p className="text-muted-foreground text-xs">
              including {numRevokedSchedules} revoked schedules
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Releasable Tokens
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="text-muted-foreground h-4 w-4"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 2,
              }).format(Number(formatEther(totalReleasableTokens as bigint)))}
            </div>
            {/* <p className="text-muted-foreground text-xs">HAIR</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Released Tokens
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="text-muted-foreground h-4 w-4"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 2,
              }).format(Number(formatEther(totalReleasedTokens as bigint)))}
            </div>
            {/* <p className="text-muted-foreground text-xs">HAIR</p> */}
          </CardContent>
        </Card>
      </div>
      <DataTable
        columns={columns}
        data={schedules}
        sortingState={sortingState}
      />
    </div>
  )
}
