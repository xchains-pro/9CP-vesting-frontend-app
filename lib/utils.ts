import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as chains from "viem/chains"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getChain(chainId: number) {
  for (const chain of Object.values(chains)) {
    if (chain.id === chainId) {
      return chain
    }
  }

  throw new Error(`Chain with id ${chainId} not found`)
}

export function truncateAddress(walletAddress: string) {
  const chars = 4
  return `${walletAddress.substring(0, chars + 2)}...${walletAddress.substring(
    42 - chars
  )}`
}
