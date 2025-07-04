import Link from "next/link"
import { Icons } from "@/components/icons"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Icons.logo className="h-8 w-8" />
          <p className="text-center text-sm leading-loose md:text-left">
            Built by traders, for traders. © {new Date().getFullYear()} Polybet Inc.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="#" className="hover:underline">
            Terms
          </Link>
          <Link href="#" className="hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
