"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Upload,
  BarChart2,
  MessageCircle,
  Menu,
  X,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useEffectOnce } from "react-use";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseClient();

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email || null);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserEmail(session?.user?.email || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-[#1a1a1a] border-r border-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.3)] px-6 py-8 space-y-8 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-[#00ff88] tracking-tight font-orbitron">
            TradingCoach
          </h2>
          <button
            className="md:hidden p-2 text-gray-400 hover:text-[#00ff88] hover:bg-[#00ff88]/10 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#00ff88]"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col space-y-3">
          <SidebarLink
            href="/onboarding"
            icon={<Brain />}
            label="Trading Profile"
            setSidebarOpen={setSidebarOpen}
          />
          <SidebarLink
            href="/upload"
            icon={<Upload />}
            label="Upload & Analyze"
            setSidebarOpen={setSidebarOpen}
          />
          <SidebarLink
            href="/history"
            icon={<BarChart2 />}
            label="Analysis"
            setSidebarOpen={setSidebarOpen}
          />
          <SidebarLink
            href="/chat"
            icon={<MessageCircle />}
            label="Trading Coach"
            setSidebarOpen={setSidebarOpen}
          />
        </nav>

        {/* User menu */}

        <div className="mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#00ff88]/20 w-full text-left text-gray-200 hover:text-[#00ff88] neon-border">
              <User className="w-5 h-5 text-[#00ff88]" />
              <span className="text-sm font-medium">
                {userEmail || "Account"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 ml-2 mt-2 bg-[#1a1a1a]/95 backdrop-blur-sm border border-[#00ff88] rounded-lg shadow-[0_0_10px_rgba(0,255,136,0.3)] neon-border">
              <DropdownMenuLabel className="text-[#00ff88] ">
                {userEmail || "Not logged in"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#00ff88]/30" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-gray-200 hover:text-[#00ff88] hover:bg-[#00ff88]/20 focus:bg-[#00ff88]/20 focus:text-[#00ff88] cursor-pointer"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden px-4 py-3 bg-[#1a1a1a] border-b border-[#00ff88] shadow-[0_0_5px_rgba(0,255,136,0.2)] flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-[#00ff88] p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#00ff88]"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-[#00ff88] ">
            TradingCoach
          </h2>
          <div className="w-6" />
        </div>
        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-10 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] overflow-x-auto overflow-y-auto">
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
  setSidebarOpen,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg group transition-all duration-200 font-medium text-gray-200 hover:bg-[#00ff88]/20 hover:text-[#00ff88] ${
        isActive ? "bg-[#00ff88]/30 text-[#00ff88] neon-border" : ""
      }`}
    >
      <span
        className={`text-xl transform group-hover:translate-x-1 transition-transform duration-200 ${
          isActive ? "text-[#00ff88]" : "text-gray-400"
        }`}
      >
        {icon}
      </span>
      <span className="text-base">{label}</span>
    </Link>
  );
}
