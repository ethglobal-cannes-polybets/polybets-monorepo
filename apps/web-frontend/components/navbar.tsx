"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import WalletButton from "./wallet-button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { isConnected } = useAccount();
  const pathname = usePathname();
  const isPortfolioActive = pathname === "/portfolio";

  return (
    <>
      {/* SVG Filter for Glass Distortion */}
      <svg style={{ display: 'none' }}>
        <filter id="glass-distortion">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
        </filter>
      </svg>

      <header className="sticky top-0 z-10 w-full">
        <div className="container mx-auto mt-4 flex h-20 items-center px-4 py-2 relative overflow-hidden border border-foreground/20 bg-transparent">
          {/* Glass Effect Layers */}
          <div className="absolute inset-0 backdrop-blur-md" style={{ filter: 'url(#glass-distortion) saturate(120%) brightness(1.15)', zIndex: 1 }} />
          <div className="absolute inset-0 bg-background/30 dark:bg-background/30" style={{ zIndex: 2 }} />
          <div className="absolute inset-0 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.75)] dark:shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15)]" style={{ zIndex: 3 }} />
          
          {/* Content Layer */}
          <div className="flex w-full items-center justify-between relative z-10">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/polybet-logo.svg"
                  alt="Polybet Logo"
                  width={116}
                  height={24}
                  className="h-6 w-auto"
                  priority
                />
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
                  <Link href="/" className="mb-6 flex items-center">
                    <Image
                      src="/polybet-logo.svg"
                      alt="Polybet Logo"
                      className="h-6 w-auto"
                    />
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
                      "text-sm font-medium uppercase transition-colors hover:text-primary px-4 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10",
                      isPortfolioActive && "text-primary font-bold bg-white/20 dark:bg-white/20"
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
    </>
  );
}
