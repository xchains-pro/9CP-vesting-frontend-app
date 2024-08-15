import "@/styles/globals.css"

import type { Metadata } from "next"
import { Toaster } from "react-hot-toast"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"

import ClientLayout from "./client"

export const metadata: Metadata = {
  title: {
    default: "Token Vesting Frontend",
    template: `%s | Token Vesting Frontend`,
  },
  description: "Manage token vesting schedules and release tokens.",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "bg-background min-h-screen font-sans antialiased",
            fontSans.variable
          )}
        >
          <ClientLayout>{children}</ClientLayout>
          <Toaster />
        </body>
      </html>
    </>
  )
}
