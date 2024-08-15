"use client"

import { ConnectKitProvider, getDefaultConfig } from "connectkit"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { FC, PropsWithChildren, useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import { createConfig, useAccount, WagmiConfig } from "wagmi"

import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { env } from "@/env.mjs"
import { useStore } from "@/hooks/useStore"
import { getChain } from "@/lib/utils"
import { readTokenVesting } from "@/wagmi/generated"

const config = createConfig(
  getDefaultConfig({
    appName: "Token Vesting Frontend",
    walletConnectProjectId: env.NEXT_PUBLIC_WC_ID,
    alchemyId: env.NEXT_PUBLIC_ALCHEMY_KEY,
    chains: [getChain(Number(env.NEXT_PUBLIC_CHAIN_ID))],
  })
)

const scheduleCreateRole =
  "0x01d6ebbe244ac14dd8a7a12f932c0ce6e9bb9236c9b55d3756a6b13de75cdc33"

const ClientLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const setCanCreateSchedules = useStore((state) => state.setCanCreateSchedules)
  const setHasSchedule = useStore((state) => state.setHasSchedule)
  const setFetching = useStore((state) => state.setFetching)

  useEffect(() => {
    setTimeout(() => {
      setHasMounted(true)
    }, 500)
  }, [])

  useEffect(() => {
    if (!isConnected || !address) return

    setFetching(true)

    async function fetchRole() {
      try {
        const hasRole = await readTokenVesting({
          functionName: "hasRole",
          args: [scheduleCreateRole as `0x${string}`, address as `0x${string}`],
        })
        setCanCreateSchedules(hasRole)
      } catch (e) {
        // This is a hacky way to check which version of the contract is deployed.
        // If hasRole throws, it means the contract is the old version and is using Ownable instead
        try {
          const owner = await readTokenVesting({
            functionName: "owner",
          })
          setCanCreateSchedules(owner === address)
        } catch (e) {
          console.log("error getting owner", e)
        }
      }
    }

    async function fetchSchedules() {
      const numSchedules = await readTokenVesting({
        functionName: "holdersVestingScheduleCount",
        args: [address as `0x${string}`],
      })
      setHasSchedule(numSchedules > 0)
    }

    const allPromises = [fetchRole(), fetchSchedules()]

    async function fetchAll() {
      await Promise.allSettled(allPromises)
      setFetching(false)
    }

    fetchAll()
  }, [address, isConnected, setCanCreateSchedules, setHasSchedule, setFetching])

  return (
    <>
      {hasMounted ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <WagmiConfig config={config}>
            <ConnectKitProvider theme="auto" mode="dark">
              <ThemeProvider attribute="class" defaultTheme="light">
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <div className="flex-1">
                    <div className="container grid items-center pb-8 pt-6 md:py-10">
                      {children}
                    </div>
                  </div>
                </div>

                <TailwindIndicator />
              </ThemeProvider>
            </ConnectKitProvider>
            <Toaster />
          </WagmiConfig>
        </motion.div>
      ) : (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex h-screen w-full items-center justify-center"
        >
          <Loader2 className="h-10 w-10 animate-spin" />
        </motion.div>
      )}
    </>
  )
}

export default ClientLayout
export { config as wagmiConfig }
