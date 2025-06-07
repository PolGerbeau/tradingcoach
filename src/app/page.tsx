"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brain, Upload, MessageCircle, BarChart2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("tradingcoach_profile");
    if (!savedProfile) {
      router.push("/onboarding");
      return;
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-20">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold text-blue-800">
          👋 Welcome {name ? name : "Trader"}
        </h1>
        <p className="text-gray-600 text-lg">
          Ready to improve your swing trading? Use the tools below to analyze
          charts, talk to your coach, or review your past setups.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <button
            onClick={() => router.push("/upload")}
            className="bg-white border border-gray-300 hover:border-blue-600 text-blue-700 hover:text-blue-800 text-lg py-5 rounded-2xl shadow-sm transition flex flex-col items-center space-y-2"
          >
            <Upload className="w-8 h-8" />
            <span>Upload Chart</span>
          </button>

          <button
            onClick={() => router.push("/chat")}
            className="bg-white border border-gray-300 hover:border-green-600 text-green-700 hover:text-green-800 text-lg py-5 rounded-2xl shadow-sm transition flex flex-col items-center space-y-2"
          >
            <MessageCircle className="w-8 h-8" />
            <span>Ask Your Coach</span>
          </button>

          <button
            onClick={() => router.push("/history")}
            className="bg-white border border-gray-300 hover:border-gray-600 text-gray-700 hover:text-gray-800 text-lg py-5 rounded-2xl shadow-sm transition flex flex-col items-center space-y-2"
          >
            <BarChart2 className="w-8 h-8" />
            <span>View History</span>
          </button>
        </div>
      </div>
    </main>
  );
}
