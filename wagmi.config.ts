import "dotenv/config"

import { defineConfig } from "@wagmi/cli"
import { actions, react } from "@wagmi/cli/plugins"

import { env } from "@/env.mjs"
import { abi } from "@/lib/vestingAbi"

export default defineConfig(() => {
  return {
    out: "wagmi/generated.ts",
    contracts: [
      {
        name: "TokenVesting",
        abi: abi,
        address: {
          [env.NEXT_PUBLIC_CHAIN_ID]:
            env.NEXT_PUBLIC_VESTING_CONTRACT as `0x${string}`,
        },
      },
    ],
    plugins: [react(), actions()],
  }
})
