"use client"

import { ConnectKitButton } from "connectkit"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useAccount } from "wagmi"

import { Button, buttonVariants } from "@/components/ui/button"
import { useStore } from "@/hooks/useStore"

export default function IndexPage() {
  const canCreateSchedules = useStore((state) => state.canCreateSchedules)
  const hasSchedule = useStore((state) => state.hasSchedule)
  const fetchingFromContract = useStore((state) => state.fetchingFromContract)
  const { isConnected, address } = useAccount()

  return (
    <div className="flex flex-col items-start gap-6">
      {isConnected && address ? (
        <>
          {fetchingFromContract ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              {canCreateSchedules && (
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                    Create or revoke schedules
                  </h2>
                  <p className="max-w-[600px]">
                    Click below to manage vesting schedules for this contract.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href="/schedules"
                      className={buttonVariants({ variant: "outline" })}
                    >
                      See All Schedules
                    </Link>
                    <Link href="/schedules/new" className={buttonVariants()}>
                      Create Schedule
                    </Link>
                  </div>
                </div>
              )}

              {hasSchedule && (
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                    Release your tokens
                  </h2>
                  <p className="max-w-[600px]">
                    Click below to see your own vesting schedule(s) and release
                    tokens.
                  </p>
                  <Link href={`/users/${address}`} className={buttonVariants()}>
                    Go To My Schedules
                  </Link>
                </div>
              )}

              {!hasSchedule && !canCreateSchedules && (
                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                    See all schedules
                  </h1>
                  <p className="max-w-[600px]">
                    You are not an admin for this vesting contract and you
                    don&apos;t have your own vesting schedule(s). But you can
                    still click below to see all schedules.
                  </p>
                  <Link href="/schedules" className={buttonVariants()}>
                    All Schedules
                  </Link>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Your wallet is not connected
          </h1>
          <p className="max-w-[600px]">
            Connect your wallet if you want to manage vesting schedules or
            release tokens from your vesting schedule(s).
          </p>
          <div className="flex gap-2">
            <ConnectKitButton.Custom>
              {({ show }) => {
                return <Button onClick={show}>Connect Wallet</Button>
              }}
            </ConnectKitButton.Custom>
            <Link
              href="/schedules"
              className={buttonVariants({ variant: "outline" })}
            >
              See All Schedules
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
