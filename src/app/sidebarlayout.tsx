"use client";

import { useState, useEffect } from "react";
import { Brain, Upload, BarChart2, MessageCircle, Menu, X } from "lucide-react";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-white border-r shadow-md px-6 py-8 space-y-8 transform transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-blue-700 tracking-tight">
            TradingCoach
          </h2>
          <button
            className="md:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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
          <SidebarLink href="/history" icon={<BarChart2 />} label="Analysis" />
          <SidebarLink
            href="/chat"
            icon={<MessageCircle />}
            label="Trading Chat"
          />
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden px-4 py-3 bg-white border-b shadow-sm flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-blue-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-blue-700">TradingCoach</h2>
          <div className="w-6" />
        </div>
        <main className="flex-1 p-6 md:p-10 bg-gradient-to-b from-white to-gray-50 transition-all duration-300 ease-in-out overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
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
