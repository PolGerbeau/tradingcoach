import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SidebarLayout from "./sidebarlayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradingCoach",
  description: "Your AI-based trading mentor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
