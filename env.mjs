// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {},
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get typeerrors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_CHAIN_ID: z.string().min(1),
    NEXT_PUBLIC_ALCHEMY_KEY: z.string().min(1),
    NEXT_PUBLIC_WC_ID: z.string().min(1),
    NEXT_PUBLIC_VESTING_CONTRACT: z.string().startsWith("0x"),
    NEXT_PUBLIC_COLOR_PRIMARY: z.string().min(1),
    NEXT_PUBLIC_COLOR_PRIMARY_FG: z.string().min(1),
    NEXT_PUBLIC_COLOR_SECONDARY: z.string().min(1),
    NEXT_PUBLIC_COLOR_SECONDARY_FG: z.string().min(1),
    NEXT_PUBLIC_LOGO_URL: z.string().startsWith("https://"),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get typeerrors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_ALCHEMY_KEY: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
    NEXT_PUBLIC_WC_ID: process.env.NEXT_PUBLIC_WC_ID,
    NEXT_PUBLIC_VESTING_CONTRACT: process.env.NEXT_PUBLIC_VESTING_CONTRACT,
    NEXT_PUBLIC_COLOR_PRIMARY: process.env.NEXT_PUBLIC_COLOR_PRIMARY,
    NEXT_PUBLIC_COLOR_PRIMARY_FG: process.env.NEXT_PUBLIC_COLOR_PRIMARY_FG,
    NEXT_PUBLIC_COLOR_SECONDARY: process.env.NEXT_PUBLIC_COLOR_SECONDARY,
    NEXT_PUBLIC_COLOR_SECONDARY_FG: process.env.NEXT_PUBLIC_COLOR_SECONDARY_FG,
    NEXT_PUBLIC_LOGO_URL: process.env.NEXT_PUBLIC_LOGO_URL,
  },
})
