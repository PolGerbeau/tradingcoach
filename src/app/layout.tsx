import "./globals.css";
import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import SidebarLayout from "./sidebarlayout";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });

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
    <html lang="en" className={orbitron.className}>
      <body className="bg-[#0a0a0a] text-gray-200">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
