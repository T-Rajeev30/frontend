import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paytm Merchant Growth Autopilot",
  description: "AI-powered growth engine for Paytm merchants",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        <Providers>
          <Sidebar />
          <main className="ml-64 min-h-screen">
            <div className="p-8">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
