"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle, Copy, FolderKanban, PlusCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SuccessViewProps {
  txHash: string;
  onDismiss: () => void;
  onClose?: () => void;
  isSticky?: boolean;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ txHash, onDismiss, onClose, isSticky }) => {
  return (
    <div className="relative flex flex-col items-center justify-center text-center h-full p-4">
      {onClose && !isSticky && (
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      )}
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h3 className="text-xl font-bold font-heading uppercase mb-2">Bet Placed Successfully</h3>
      <p className="text-muted-foreground mb-6">Your bet has been securely processed through the Oasis Network.</p>

      <Card className="w-full mb-6 bg-accent/50 border-foreground/10">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium">Transaction Hash</p>
          <div className="flex items-center gap-2 p-2 bg-background border rounded-md">
            <span className="text-xs font-mono truncate text-muted-foreground">{txHash}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                navigator.clipboard.writeText(txHash).catch(() => undefined);
                toast("Copied to clipboard!");
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="w-full space-y-3">
        <Button asChild className="w-full">
          <Link href="/portfolio">
            <FolderKanban className="w-4 h-4 mr-2" />
            View in Portfolio
          </Link>
        </Button>
        <Button variant="outline" onClick={onDismiss} className="w-full bg-transparent">
          <PlusCircle className="w-4 h-4 mr-2" />
          Place Another Bet
        </Button>
      </div>
    </div>
  );
}; 