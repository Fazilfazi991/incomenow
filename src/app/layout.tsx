import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { AcquisitionTracker } from "@/components/acquisition-tracker";
import { GoogleAnalytics } from "@/components/google-analytics";
import { getGoogleAnalyticsId, getSiteOrigin, isProductionSite } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: getSiteOrigin() ? new URL(getSiteOrigin()!) : undefined,
  robots: { index: false, follow: false },
  title: { default: "IncomeNow", template: "%s · IncomeNow" },
  description: "Practical digital business ideas, implementation guidance, and a personal workspace for testing an offer.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const acquisitionTrackingEnabled = process.env.NEXT_PUBLIC_ACQUISITION_TRACKING_ENABLED === "true";
  const measurementId = isProductionSite(process.env) ? getGoogleAnalyticsId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) : null;
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`} data-scroll-behavior="smooth">
      <body>{children}{acquisitionTrackingEnabled ? <AcquisitionTracker /> : null}{measurementId ? <GoogleAnalytics measurementId={measurementId} /> : null}</body>
    </html>
  );
}
