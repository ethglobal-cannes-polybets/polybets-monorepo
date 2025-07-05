import type React from "react";
import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "sonner";
import { headers } from "next/headers";
import { AppKitProvider } from "@/providers/appkit-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Polybet - The Prediction Market Aggregator",
  description: "Bet on anything, anywhere. Your alpha, protected.",
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/polybet-icon.png", type: "image/png", sizes: "32x32" },
      { url: "/polybet-icon.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: [
      { url: "/polybet-icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/polybet-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const cookies = headersList.get("cookie");

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceMono.variable} font-sans bg-background text-foreground`}
      >
        <AppKitProvider cookies={cookies}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster 
            position="top-left"
            offset={16}
            toastOptions={{
              className: "border border-foreground/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg shadow-lg",
            }}
          />
        </AppKitProvider>
      </body>
    </html>
  );
}
