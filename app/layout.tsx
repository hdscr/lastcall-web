import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RH44 OFP WebApp",
  description: "Flight planning, performance and printout for RH44.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        <nav className="border-b bg-white">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-2 p-3 text-sm">
            <Link href="/" className="rounded px-2 py-1 hover:bg-zinc-100">Flight Plan</Link>
            <Link href="/print" className="rounded px-2 py-1 hover:bg-zinc-100">Print</Link>
            <Link href="/voice" className="rounded px-2 py-1 hover:bg-zinc-100">Voice</Link>
            <Link href="/admin/performance" className="rounded px-2 py-1 hover:bg-zinc-100">Admin Performance</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

