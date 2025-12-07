import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageContainer } from "@/components/PageContainer";
import { ClientMusicPlayer } from "@/components/MusicPlayer/ClientMusicPlayer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react"

// Declare global window gtag
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "set",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

// GA_MEASUREMENT_ID is used in GoogleAnalytics component
const _GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "OQSI - Outie Query System Interface",
  description: "Describe your Innie to learn about your Outie",
  metadataBase: new URL('https://YourOutie.is'),
  icons: {
    icon: [{
      url: '/favicon.png',
      type: 'image/png',
    }],
    apple: [{
      url: '/favicon.png',
      type: 'image/png',
    }],
  },
  applicationName: "OQSI",
  authors: [{ name: "" }],
  keywords: ["Severance", "Innie", "Outie", "Your Outie is", "Lumon"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://YourOutie.is",
    title: "OQSI - Outie Query System Interface",
    description: "Describe your Innie to learn about your Outie",
    images: [
      {
        url: "/OQSI-FeaturedImage.png",
        width: 800,
        height: 600,
        alt: "OQSI - Outie Query System Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OQSI - Outie Query System Interface",
    description: "Describe your Innie to learn about your Outie",
    images: ["/OQSI-FeaturedImage.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <PageContainer>
          {children}
        </PageContainer>
        {/* Use the client component wrapper */}
        <ClientMusicPlayer />
        <Analytics />
      </body>
    </html>
  );
}
