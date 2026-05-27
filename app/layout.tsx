import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export const metadata: Metadata = {
  title: "GradAtlas | University Application Tracker & Manager",
  description: "Track, manage, and compare university applications with live exchange rate currency conversion. Beautiful side-by-side dashboard comparisons, priority deadline alert systems, and secure backups.",
  keywords: ["university tracker", "college admissions", "scholar dashboard", "study abroad", "next.js tracker", "INR converter"],
  authors: [{ name: "GradAtlas" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased bg-[#09090b] text-[#f4f4f5] selection:bg-primary selection:text-white`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
