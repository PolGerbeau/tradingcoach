import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Brain, Upload, BarChart2, MessageCircle } from "lucide-react";

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
        <div className="flex min-h-screen">
          <aside className="w-64 bg-white border-r shadow-md px-6 py-8 space-y-8">
            <h2 className="text-3xl font-extrabold text-blue-700 tracking-tight">
              TradingCoach
            </h2>

            <nav className="flex flex-col space-y-3">
              <SidebarLink
                href="/onboarding"
                icon={<Brain />}
                label="Your Profile"
              />
              <SidebarLink
                href="/upload"
                icon={<Upload />}
                label="Upload & Analyze"
              />
              <SidebarLink
                href="/history"
                icon={<BarChart2 />}
                label="Analysis"
              />
              <SidebarLink
                href="/chat"
                icon={<MessageCircle />}
                label="Trading Chat"
              />
            </nav>
          </aside>
          <main className="flex-1 p-10 bg-gradient-to-b from-white to-gray-50 transition-all duration-300 ease-in-out overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function SidebarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-4 py-2 rounded-lg group transition-all duration-200 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-800"
    >
      <span className="text-xl transform group-hover:translate-x-1 transition-transform duration-200">
        {icon}
      </span>
      <span className="text-base">{label}</span>
    </a>
  );
}
