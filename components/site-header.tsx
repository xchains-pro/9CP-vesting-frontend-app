import { ConnectKitButton } from "connectkit"

import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ConnectKitButton.Custom>
              {({ isConnected, show, truncatedAddress, ensName }) => {
                return (
                  <Button size="sm" onClick={show}>
                    {isConnected
                      ? ensName ?? truncatedAddress
                      : "Connect Wallet"}
                  </Button>
                )
              }}
            </ConnectKitButton.Custom>
          </nav>
        </div>
      </div>
    </header>
  )
}
