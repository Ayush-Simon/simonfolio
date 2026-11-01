import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Sky from "@/components/Sky";
import { paintSky } from "@/lib/sky-paint";
import "./globals.css";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export const viewport: Viewport = { themeColor: "#f5f3ee" };

// runs before first paint so the page opens in the right sky (no flash of daytime at night)
const skyScript = `try{(${paintSky.toString()})(${site.sky.utcOffsetMin},null,null,new URLSearchParams(location.search).get("sky"))}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} ${interTight.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skyScript }} />
      </head>
      <body>
        <Sky />
        <SmoothScroll />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
