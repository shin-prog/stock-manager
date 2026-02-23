import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Home Stock Manager",
  description: "Track inventory and prices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col md:flex-row h-[100dvh] overflow-hidden`}
      >
        <aside className="hidden md:block w-64 border-r overflow-y-auto">
          <div className="h-full py-4 px-2">
            <Sidebar />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-40 md:pb-8">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}

