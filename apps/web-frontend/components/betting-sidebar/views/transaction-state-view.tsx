"use client";

import * as React from "react";
import { Shield, Zap, Loader2 } from "lucide-react";

interface TransactionStateViewProps {
  state: "approving" | "signing" | "placing";
}

export const TransactionStateView: React.FC<TransactionStateViewProps> = ({ state }) => {
  const content = {
    approving: {
      icon: <Shield className="w-16 h-16 text-blue-500 mb-4" />,
      title: "Approve Spending",
      description: "Please approve the transaction in your wallet to allow Polybet to use your funds for this bet.",
    },
    signing: {
      icon: <Zap className="w-16 h-16 text-orange-500 mb-4" />,
      title: "Sign Transaction",
      description: "Please sign the bet transaction in your wallet to confirm your bet.",
    },
    placing: {
      icon: <Zap className="w-16 h-16 text-amber-500 mb-4" />,
      title: "Placing Bet",
      description: "Your bet is being securely processed through the Oasis Network. This may take a moment.",
    },
  } as const;

  const { icon, title, description } = content[state];

  return (
    <div className="flex flex-col items-center justify-center text-center h-full p-4">
      {icon}
      <h3 className="text-xl font-bold font-heading uppercase mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}; 