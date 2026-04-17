import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const coolvetica = localFont({
  src: "./fonts/coolvetica-rg.woff",
  display: "swap",
  variable: "--font-display",
});

// DM Sans is the closest free Google-Fonts match to "Skandiasn" (Skandia
// Sans / Scandia) — same humanist-geometric character, two-story a/g.
// "Skandiasn" is listed first in the --font-sans stack below so any
// viewer with the licensed font installed locally will render it instead.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Source AI — The Migration Engine for Consultants",
  description:
    "From transcript to live system. Source AI handles discovery, scanning, strategy, BRD generation, and migration execution.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${coolvetica.variable} ${dmSans.variable} ${instrumentSerif.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <TooltipProvider delayDuration={120}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
