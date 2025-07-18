"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import {
  Brain,
  Upload,
  BarChart2,
  MessageCircle,
  Menu,
  User,
} from "lucide-react";

export default function OnboardingPage() {
  const steps = [
    {
      key: "profile",
      title: "What type of trader are you?",
      options: [
        {
          label: "Swing Trader",
          description: "Focus on capturing short- to medium-term price moves.",
        },
        {
          label: "Day Trader",
          description: "Open and close trades within the same day.",
        },
        {
          label: "Breakout Trader",
          description: "Trade assets breaking through key levels.",
        },
        {
          label: "Psychological Trader",
          description: "Base decisions on sentiment and crowd behavior.",
        },
      ],
    },
    {
      key: "strategy",
      title: "What strategy do you want to follow?",
      options: [
        {
          label: "TSL Breakout",
          description:
            "Buy/Sell based on trend line breakouts and trailing support levels.",
        },
        {
          label: "Support Bounce",
          description: "Enter after a bounce off a known support level.",
        },
        {
          label: "RSI + Candles",
          description:
            "Use RSI indicators and candle patterns to identify entries.",
        },
        {
          label: "Support / Resistance",
          description: "Trade around key zones of buying/selling pressure.",
        },
      ],
    },
    {
      key: "experience",
      title: "What is your experience level?",
      options: [
        {
          label: "New to trading",
          description: "You are just starting and want guidance.",
        },
        {
          label: "Some experience",
          description: "You’ve placed trades before but are still learning.",
        },
        {
          label: "Experienced",
          description: "You have a strong grasp of the markets.",
        },
      ],
    },
    {
      key: "timeframe",
      title: "What timeframe do you usually trade?",
      options: [
        {
          label: "1-5 min",
          description: "Scalp fast movements, multiple trades a day.",
        },
        {
          label: "15m - 1h",
          description: "Intraday moves with clearer setups.",
        },
        { label: "4h - 1D", description: "Swing trades held over days." },
        { label: "1W or more", description: "Longer-term positional trading." },
      ],
    },
    {
      key: "asset",
      title: "What assets do you mostly trade?",
      multi: true,
      options: [
        {
          label: "Stocks",
          description: "Shares of companies on stock exchanges.",
        },
        {
          label: "Forex",
          description: "Currency pairs like EUR/USD or GBP/JPY.",
        },
        { label: "Crypto", description: "Digital assets like BTC, ETH, etc." },
        {
          label: "Indices",
          description: "Market baskets like SP500 or NASDAQ.",
        },
        {
          label: "Commodities",
          description: "Gold, oil, silver and other physical assets.",
        },
      ],
    },
    {
      key: "risk",
      title: "What is your risk tolerance?",
      options: [
        {
          label: "Conservative",
          description: "Prefer safer, low-risk trades.",
        },
        {
          label: "Moderate",
          description: "Balanced approach to risk and reward.",
        },
        {
          label: "Aggressive",
          description: "Comfortable taking high-risk, high-reward trades.",
        },
      ],
    },
  ];

  const [form, setForm] = useState<any>({
    profile: "",
    strategy: "",
    experience: "",
    timeframe: "",
    asset: [],
    risk: "",
  });

  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("tradingcoach_profile");
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse tradingcoach_profile:", error);
        setForm({
          profile: "",
          strategy: "",
          experience: "",
          timeframe: "",
          asset: [],
          risk: "",
        });
      }
    }
  }, []);

  const currentStep = steps[stepIndex];
  const isMulti = currentStep.multi;
  const selectedValues = form[currentStep.key];

  const handleSelect = (key: string, value: string, multi = false) => {
    if (multi) {
      setForm((prev: any) => {
        const current = Array.isArray(prev[key]) ? prev[key] : [];
        const updated = current.includes(value)
          ? current.filter((v: string) => v !== value)
          : [...current, value];
        return { ...prev, [key]: updated };
      });
    } else {
      setForm({ ...form, [key]: value });
    }
  };

  const handleNext = () => {
    const step = steps[stepIndex];
    const value = form[step.key];
    const isEmpty = Array.isArray(value) ? value.length === 0 : value === "";
    if (isEmpty) return alert("Please select at least one option.");

    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      const finalForm = {
        ...form,
        asset: Array.isArray(form.asset) ? form.asset : [form.asset],
      };
      localStorage.setItem("tradingcoach_profile", JSON.stringify(finalForm));
      window.location.href = "/upload";
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleReset = () => {
    if (confirm("Reset your entire profile?")) {
      setForm({
        profile: "",
        strategy: "",
        experience: "",
        timeframe: "",
        asset: [],
        risk: "",
      });
      setStepIndex(0);
      localStorage.removeItem("tradingcoach_profile");
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 animate-fade-in grid md:grid-cols-[2fr_1fr] gap-12 items-start">
      <div>
        <div className="mb-6 text-sm text-gray-200">
          Step {stepIndex + 1} of {steps.length}
        </div>
        <h1 className="text-4xl font-extrabold text-[#00ff88] mb-6 flex items-center gap-2 ">
          <Brain className="w-8 h-8 text-[#00ff88]" />
          Trading Profile
        </h1>
        <h2 className="text-xl font-semibold mb-8 text-gray-200">
          {currentStep.title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {currentStep.options.map((option) => (
            <button
              key={option.label}
              onClick={() =>
                handleSelect(currentStep.key, option.label, isMulti)
              }
              className={`p-5 rounded-2xl shadow-md border transition-all flex flex-col gap-2 hover:scale-[1.02] ${
                isMulti
                  ? selectedValues.includes(option.label)
                    ? "bg-[#1a1a1a] border-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.3)] neon-border"
                    : "hover:bg-[#00ff88]/10 border-gray-700"
                  : form[currentStep.key] === option.label
                  ? "bg-[#1a1a1a] border-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.3)] neon-border"
                  : "hover:bg-[#00ff88]/10 border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-200">{option.label}</span>
                {(isMulti
                  ? selectedValues.includes(option.label)
                  : form[currentStep.key] === option.label) && (
                  <CheckCircle className="w-5 h-5 text-[#00ff88]" />
                )}
              </div>
              <p className="text-sm text-gray-200">{option.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          {stepIndex > 0 && (
            <button
              onClick={handleBack}
              className="bg-[#1a1a1a] border border-[#00ff88] text-gray-200 px-5 py-2 rounded-xl shadow-[0_0_5px_rgba(0,255,136,0.2)] hover:bg-[#00ff88]/20 text-sm font-medium"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-[#00ff88] to-[#00cc70] text-black font-semibold px-6 py-3 rounded-xl shadow-[0_0_10px_#00ff88] hover:shadow-[0_0_15px_#00ff88] transition-all duration-200"
          >
            {stepIndex === steps.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>

      <div className="hidden md:block self-start bg-[#1a1a1a] border border-[#00ff88] rounded-2xl p-6 shadow-[0_0_10px_rgba(0,255,136,0.3)] space-y-5 transition-all hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] neon-border">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-[#00ff88] ">
            Current Profile
          </h3>
          <button
            onClick={handleReset}
            className="text-sm text-[#00ff88] hover:text-[#00ffbb] font-medium transition-colors"
            aria-label="Reset profile"
          >
            Reset
          </button>
        </div>

        <div className="grid gap-4">
          {Object.entries(form).map(([key, value]) => (
            <div key={key} className="flex items-start gap-3">
              <p className="text-sm text-[#00ff88] capitalize font-medium w-1/3">
                {key}
              </p>
              <p className="text-sm text-gray-200 flex-1">
                {Array.isArray(value)
                  ? value.length > 0
                    ? value.join(", ")
                    : "–"
                  : typeof value === "string" && value
                  ? value
                  : "–"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
