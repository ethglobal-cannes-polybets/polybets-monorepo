"use client";

import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { useAppKit } from "@reown/appkit/react";

function truncateAddress(address: string): string {
  return address.slice(0, 6) + "…" + address.slice(-4);
}

export interface WalletButtonProps {
  className?: string;
}

export default function WalletButton({ className }: WalletButtonProps) {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  if (!isConnected) {
    return (
      <Button className={className} onClick={() => open()}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className={cn("bg-transparent", className)}
      onClick={() => open()}
    >
      {truncateAddress(address!)}
    </Button>
  );
} 