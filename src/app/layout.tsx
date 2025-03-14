import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageContainer } from "@/components/PageContainer";
import { ClientMusicPlayer } from "@/components/MusicPlayer/ClientMusicPlayer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OQSI - Outie Query System Interface",
  description: "Describe your Innie to learn about your Outie",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
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
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <PageContainer>
          {children}
        </PageContainer>
        {/* Use the client component wrapper */}
        <ClientMusicPlayer />
      </body>
    </html>
  );
}
