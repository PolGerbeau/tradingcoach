"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brain, Upload, MessageCircle, BarChart2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("tradingcoach_profile");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setName(profile.name || null);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl font-extrabold text-[#00ff88] font-orbitron">
          Welcome {name ? name : "Trader"}
        </h1>
        <p className="text-gray-200 text-lg">
          Ready to improve your trading? Use the tools below to analyze charts,
          talk to your coach, or review your past setups.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 animate-fade-in">
          <button
            onClick={() => router.push("/onboarding")}
            className="bg-gradient-to-r from-[#00ff88] to-[#00cc70] text-black border border-[#00ff88] hover:shadow-[0_0_15px_#00ff88] text-lg py-5 rounded-xl shadow-[0_0_10px_#00ff88] neon-border transition-all flex flex-col items-center space-y-2"
          >
            <Brain className="w-8 h-8 text-black" />
            <span>Trading Profile</span>
          </button>

          <button
            onClick={() => router.push("/upload")}
            className="bg-gradient-to-r from-[#00ff88] to-[#00cc70] text-black border border-[#00ff88] hover:shadow-[0_0_15px_#00ff88] text-lg py-5 rounded-xl shadow-[0_0_10px_#00ff88] neon-border transition-all flex flex-col items-center space-y-2"
          >
            <Upload className="w-8 h-8 text-black" />
            <span>Upload & Analyze</span>
          </button>

          <button
            onClick={() => router.push("/history")}
            className="bg-gradient-to-r from-[#00ff88] to-[#00cc70] text-black border border-[#00ff88] hover:shadow-[0_0_15px_#00ff88] text-lg py-5 rounded-xl shadow-[0_0_10px_#00ff88] neon-border transition-all flex flex-col items-center space-y-2"
          >
            <BarChart2 className="w-8 h-8 text-black" />
            <span>Analysis</span>
          </button>

          <button
            onClick={() => router.push("/chat")}
            className="bg-gradient-to-r from-[#00ff88] to-[#00cc70] text-black border border-[#00ff88] hover:shadow-[0_0_15px_#00ff88] text-lg py-5 rounded-xl shadow-[0_0_10px_#00ff88] neon-border transition-all flex flex-col items-center space-y-2"
          >
            <MessageCircle className="w-8 h-8 text-black" />
            <span>Ask Your Coach</span>
          </button>
        </div>
      </div>
    </main>
  );
}
