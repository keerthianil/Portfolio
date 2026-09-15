import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Schibsted_Grotesk,
  Patrick_Hand,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
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
  metadataBase: new URL("https://keerthianil.vercel.app"),
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
    <html lang="en">
      <body
        className={`${fraunces.variable} ${schibsted.variable} ${patrickHand.variable} ${jetbrainsMono.variable}`}
      >
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
