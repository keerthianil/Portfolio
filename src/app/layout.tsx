import type { Metadata, Viewport } from "next";
import {
  Newsreader,
  Public_Sans,
  Patrick_Hand,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

/**
 * Newsreader for display and Public Sans for everything else.
 *
 * Public Sans is the typeface the US government's design system ships, drawn
 * for services that have to be legible to everyone who is required to use
 * them. On a site about accessibility that is an argument rather than a
 * decoration. Newsreader was drawn for reading at length on a screen, which is
 * what the case studies ask of it.
 */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://keerthiaportfolio.vercel.app"),
  title: "Keerthi Anil - Designer, Developer & Researcher",
  description:
    "I design, build, and research interfaces for the people default products miss. iOS, SwiftUI, accessibility, AI.",
  openGraph: {
    title: "Keerthi Anil - Designer, Developer & Researcher",
    description:
      "I design, build, and research interfaces for the people default products miss.",
    type: "website",
  },
};

// No `maximum-scale` and no `user-scalable: no`. Locking pinch zoom fails
// WCAG 1.4.4.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0C0A09",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The font variables go on <html>, not <body>. The @theme tokens that point
    // at them (--font-display and friends) are emitted at :root, so a variable
    // defined further down the tree resolves to nothing and every family
    // silently falls back to the system stack.
    <html
      lang="en"
      className={`${newsreader.variable} ${publicSans.variable} ${patrickHand.variable} ${jetbrainsMono.variable}`}
      // Browser extensions write their own attributes onto <html> and <body>
      // before React hydrates: a grammar checker adds `data-qb-installed`, a
      // password manager adds its own, and each one is a hydration mismatch
      // that React reports as an error the visitor did not cause and cannot
      // fix. This suppresses the attribute comparison on these two elements
      // only. Everything inside them is still checked.
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
