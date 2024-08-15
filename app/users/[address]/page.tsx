import type { Metadata } from "next"
import { createPublicClient, formatEther, getContract, http } from "viem"
import { Chain } from "wagmi"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { env } from "@/env.mjs"
import { abi as erc20Abi } from "@/lib/erc20Abi"
import { getChain, truncateAddress } from "@/lib/utils"
import { abi } from "@/lib/vestingAbi"
import { ProcessedSchedule, Schedule } from "@/types/schedule"

import { UserTable } from "./user-table"

const chain: Chain = getChain(Number(env.NEXT_PUBLIC_CHAIN_ID))

const client = createPublicClient({
  chain: chain,
  transport: http(
    `${chain.rpcUrls.alchemy.http[0]}/${env.NEXT_PUBLIC_ALCHEMY_KEY}`
  ),
})

export const metadata: Metadata = {
  title: `User Schedules`,
}

export const revalidate = 60 * 10 // revalidate every 10 minutes

export default async function Page({
  params,
}: {
  params: { address: string }
}) {
  let schedules: ProcessedSchedule[] = []

  let ensName = null
  // Only get ENS name for mainnet
  if (chain.id == 1) {
    ensName = await client.getEnsName({
      address: params.address as `0x${string}`,
    })
  }

  const vestingContract = getContract({
    address: env.NEXT_PUBLIC_VESTING_CONTRACT as `0x${string}`,
    abi: abi,
    publicClient: client,
  })

  const vTokenSymbol = await vestingContract.read.symbol()

  const nativeTokenAddress = await vestingContract.read.nativeToken()

  const nativeTokenContract = getContract({
    address: nativeTokenAddress as `0x${string}`,
    abi: erc20Abi,
    publicClient: client,
  })

  const nativeTokenSymbol = await nativeTokenContract.read.symbol()

  const nativeTokenBalance = await nativeTokenContract.read.balanceOf([
    params.address as `0x${string}`,
  ])

  const vTokenBalance = await vestingContract.read.balanceOf([
    params.address as `0x${string}`,
  ])

  const scheduleCount = await vestingContract.read.holdersVestingScheduleCount([
    params.address as `0x${string}`,
  ])

  let totalReleasableTokens: bigint = BigInt(0)
  let totalReleasedTokens: bigint = BigInt(0)

  for (let i = 0; i < Number(scheduleCount); i++) {
    const schedule: Schedule =
      await vestingContract.read.getVestingScheduleByAddressAndIndex([
        params.address as `0x${string}`,
        BigInt(i),
      ])

    const scheduleId =
      await vestingContract.read.computeVestingScheduleIdForAddressAndIndex([
        params.address as `0x${string}`,
        BigInt(i),
      ])

    let released: bigint = schedule.released as bigint
    totalReleasedTokens += released

    let releasableAmount = BigInt(0)
    if (schedule.status == 0) {
      releasableAmount = await vestingContract.read.computeReleasableAmount([
        scheduleId,
      ])
      totalReleasableTokens += releasableAmount
    }

    schedules.push({
      ...schedule,
      ...{ id: scheduleId, releasableAmount, ensName, ensAvatar: null },
    })
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        {ensName ? ensName : truncateAddress(params.address)}
      </h1>
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total tokens ({chain.name})
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
              }).format(
                Number(
                  formatEther((vTokenBalance + nativeTokenBalance) as bigint)
                )
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 2,
              }).format(Number(formatEther(vTokenBalance as bigint)))}{" "}
              {vTokenSymbol}
            </p>
            <p className="text-muted-foreground text-xs">
              {new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 2,
              }).format(Number(formatEther(nativeTokenBalance as bigint)))}{" "}
              {nativeTokenSymbol}
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
      <div>
        <UserTable schedules={schedules} />
      </div>
    </div>
  )
}
