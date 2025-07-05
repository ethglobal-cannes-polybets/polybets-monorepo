"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { Icons } from "@/components/icons";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import WalletButton from "./wallet-button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { isConnected } = useAccount();
  const pathname = usePathname();
  const isPortfolioActive = pathname === "/portfolio";

  return (
    <header className="sticky top-0 z-50 w-full ">
      <div className="container mx-auto mt-4 flex h-20 items-center px-4 py-2 border border-foreground/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo className="h-8 w-8" />
              <span className="font-bold font-heading">POLYBET</span>
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <Link href="/" className="mb-6 flex items-center space-x-2">
                  <Icons.logo className="h-8 w-8" />
                  <span className="font-bold font-heading">POLYBET</span>
                </Link>
                <div className="flex flex-col space-y-4">
                  {!isConnected ? (
                    <WalletButton className="w-full" />
                  ) : (
                    <>
                      <Link
                        href="/portfolio"
                        className={cn(
                          "text-foreground uppercase font-medium transition-colors hover:text-primary",
                          isPortfolioActive && "text-primary font-bold"
                        )}
                      >
                        Portfolio
                      </Link>
                      <WalletButton className="w-full" />
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right side - Wallet & Portfolio */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <>
                <Link
                  href="/portfolio"
                  className={cn(
                    "text-sm font-medium uppercase transition-colors hover:text-primary",
                    isPortfolioActive && "text-primary font-bold"
                  )}
                >
                  Portfolio
                </Link>
                <WalletButton />
              </>
            ) : (
              <WalletButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
