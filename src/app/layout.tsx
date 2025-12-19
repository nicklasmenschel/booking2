import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Garden Table - Create & Book Food Experiences",
    template: "%s | Garden Table",
  },
  description:
    "The simplest way to create, discover, and book food experiences. Host wine tastings, cooking classes, private dinners, and more.",
  keywords: [
    "food experiences",
    "wine tasting",
    "cooking class",
    "private dining",
    "restaurant reservations",
    "event booking",
  ],
  authors: [{ name: "Garden Table" }],
  creator: "Garden Table",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gardentable.com",
    siteName: "Garden Table",
    title: "Garden Table - Create & Book Food Experiences",
    description:
      "The simplest way to create, discover, and book food experiences.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Garden Table",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Garden Table - Create & Book Food Experiences",
    description:
      "The simplest way to create, discover, and book food experiences.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen bg-background font-sans antialiased">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
