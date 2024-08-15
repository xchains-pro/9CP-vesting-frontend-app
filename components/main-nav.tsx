"use client"

import Link from "next/link"
import * as React from "react"
import { useAccount } from "wagmi"

import { siteConfig } from "@/config/site"
import { env } from "@/env.mjs"
import { useStore } from "@/hooks/useStore"
import { cn } from "@/lib/utils"
import { NavItem } from "@/types/nav"

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const hasSchedule = useStore((state) => state.hasSchedule)
  const { isConnected, address } = useAccount()

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <img alt="Logo" src={env.NEXT_PUBLIC_LOGO_URL} className="h-10" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      {items?.length ? (
        <nav className="flex gap-6">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "text-muted-foreground flex items-center text-sm font-medium",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}

          {isConnected && hasSchedule && (
            <Link
              href={`/users/${address}`}
              className={cn(
                "text-muted-foreground flex items-center text-sm font-medium"
              )}
            >
              My Schedules
            </Link>
          )}
        </nav>
      ) : null}
    </div>
  )
}
