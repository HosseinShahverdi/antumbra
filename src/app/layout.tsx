import type { Metadata, Viewport } from "next";
import { Anybody, Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Antumbra — Eclipse Atelier",
  description:
    "Antumbra is a fictional Lisbon atelier making couture headwear by hand, in editions of nine — crowns for the hour the light goes out. A brand and web concept.",
  openGraph: {
    title: "Antumbra — Eclipse Atelier",
    description: "Crowns for the hour the light goes out. Couture headwear, hand-built in editions of nine.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "A silhouetted figure before a glowing disc, a black headpiece aligned at its centre like an eclipse." }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#09090a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anybody.variable} ${instrument.variable} ${geist.variable} ${geistMono.variable}`}>
      <body>
        {/* without JavaScript the opening sequence never blocks the page */}
        <noscript dangerouslySetInnerHTML={{ __html: "<style>.preloader{display:none!important}</style>" }} />
        {children}
      </body>
    </html>
  );
}
