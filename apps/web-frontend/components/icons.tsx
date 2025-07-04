import type React from "react"
const PolyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6 0L12 3.5V10.5L6 12L0 10.5V3.5L6 0Z" fill="currentColor" />
  </svg>
)

const LimitlessIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const KalshiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2 2H10V10H2V2Z" stroke="currentColor" strokeWidth="2" />
    <path d="M6 2V10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const EthIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" {...props}>
    <title>Ethereum</title>
    <path
      d="M11.944 17.97L4.58 13.62l7.364 4.35zm.112 0l7.365-4.35-7.365 4.35zM12 16.493L4.58 12.144l7.42 4.349zm0 0l7.42-4.35-7.42 4.35zM12 5.92L4.58 10.27l7.42-4.35zm0 0l7.42 4.35-7.42-4.35zM12 4.468l-7.42 4.35L12 0l7.42 8.818-7.42-4.35z"
      fill="currentColor"
    />
  </svg>
)

const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4" fill="none" />
    <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="4" fill="none" />
    <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="4" fill="none" />
  </svg>
)

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6904H306.615L611.412 515.685L658.88 583.579L1055.08 1154.33H892.476L569.165 687.854V687.828Z"
      fill="currentColor"
    />
  </svg>
)

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.07.07 0 0 0-.07.07c0 .34.03.67.07.99.63.22 1.24.49 1.82.8A10.46 10.46 0 0 1 18.31 8c.34.46.64.94.91 1.44.2.36.39.73.55 1.11a.07.07 0 0 0 .07.06c.34-.03.67-.07 1-.1a.07.07 0 0 0 .07-.06c-.02-.12-.03-.25-.05-.37a10.4 10.4 0 0 0-.62-1.77c-.2-.48-.43-.95-.69-1.4Z" />
    <path d="M4.73 5.33C6.06 4.71 7.5 4.26 9 4a.07.07 0 0 1 .07.07c0 .34-.03.67-.07.99a12.8 12.8 0 0 0-1.82.8A10.46 10.46 0 0 0 5.69 8c-.34.46-.64.94-.91 1.44-.2.36-.39.73-.55 1.11a.07.07 0 0 1-.07.06c-.34-.03-.67-.07-1-.1a.07.07 0 0 1-.07-.06c.02-.12.03-.25.05-.37a10.4 10.4 0 0 1 .62-1.77c.2-.48.43-.95.69-1.4Z" />
    <path d="M12 6C9.25 6 7 8.25 7 11s2.25 5 5 5 5-2.25 5-5-2.25-5-5-5Zm-2.5 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Z" />
    <path d="M19.27 5.33A12.54 12.54 0 0 0 12 3C6.48 3 2 7.48 2 13c0 3.53 1.82 6.63 4.5 8.47a.07.07 0 0 0 .1.03c.6-.23 1.18-.5 1.74-.82a.07.07 0 0 0 .03-.1c-.3-.45-.55-.93-.76-1.44a.07.07 0 0 1 .01-.08c.4-.27.8-.56 1.17-.88a.07.07 0 0 1 .08-.01c.4.23.82.44 1.25.63a.07.07 0 0 0 .08 0c.43-.19.85-.4 1.25-.63a.07.07 0 0 1 .08.01c.37.32.77.61 1.17.88a.07.07 0 0 1 .01.08c-.21.51-.46.99-.76 1.44a.07.07 0 0 0 .03.1c.56.32 1.14.59 1.74.82a.07.07 0 0 0 .1-.03C20.18 19.63 22 16.53 22 13c0-4.07-2.9-7.54-6.73-7.67Z" />
  </svg>
)

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M21.883 12l-7.527 6.235.644-4.26L20.5 12l-5.207-2.035.644-4.26L21.883 12zM11.319 16.013l.441 3.987-2.849-3.098-3.544 2.813-4.24-16.135 18.65 7.243-9.461 1.285z" />
  </svg>
)

export const Icons = {
  poly: PolyIcon,
  limitless: LimitlessIcon,
  kalshi: KalshiIcon,
  eth: EthIcon,
  logo: LogoIcon,
  x: XIcon,
  discord: DiscordIcon,
  telegram: TelegramIcon,
}
