"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageCircle, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function TradingCoachChat() {
  const initialMessages =
    typeof window !== "undefined"
      ? localStorage.getItem("tradingcoach_chat")
      : null;
  const [messages, setMessages] = useState<Message[]>(
    initialMessages ? JSON.parse(initialMessages) : []
  );
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [pastAnalyses, setPastAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("tradingcoach_profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Invalid profile data:", e);
      }
    }

    const savedAnalyses = localStorage.getItem("tradingcoach_history");
    if (savedAnalyses) {
      try {
        setPastAnalyses(JSON.parse(savedAnalyses));
      } catch (e) {
        console.error("Invalid analysis history:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tradingcoach_chat", JSON.stringify(messages));
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    addMessage(userMessage);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        history: [...messages, userMessage],
        message: input,
        pastAnalyses,
      }),
    });

    const data = await res.json();

    addMessage({
      role: "assistant",
      text:
        data.reply?.replace(
          /_UPLOAD_LINK_/g,
          '<a href="/upload" class="text-[#00ff88] underline hover:text-[#00ffbb]">this page</a>'
        ) || "No response from coach.",
    });
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
      localStorage.removeItem("tradingcoach_chat");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 min-h-screen relative ">
      <h1 className="text-4xl font-extrabold text-[#00ff88] mb-6 flex items-center gap-2 ">
        <MessageCircle className="w-8 h-8 text-[#00ff88]" />
        Trading Coach
      </h1>

      <button
        onClick={clearChat}
        className="absolute top-6 right-6 bg-gradient-to-r from-[#00ff88] to-[#00cc70] text-black px-4 py-2 rounded-xl shadow-[0_0_10px_#00ff88] hover:shadow-[0_0_15px_#00ff88] transition-all duration-200 text-sm"
        aria-label="Clear chat"
      >
        Clear Chat
      </button>

      <div
        ref={chatRef}
        className="bg-[#1a1a1a]/95 backdrop-blur-sm rounded-2xl border border-[#00ff88] h-[600px] sm:h-[500px] overflow-y-auto px-6 py-4 shadow-[0_0_10px_rgba(0,255,136,0.3)] mb-6 space-y-4 animate-fade-in neon-border"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-16 h-16 text-[#00ff88] mb-4 animate-pulse" />
            <p className="text-gray-200 italic text-lg">
              Start chatting with your trading coach...
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm whitespace-pre-line transition-all duration-300 ${
                msg.role === "user"
                  ? "bg-[#00ff88]/20 text-gray-200"
                  : "bg-[#1a1a1a] text-gray-200 border border-[#00ff88]/30"
              } ${
                msg.role === "user"
                  ? "animate-slide-in-right"
                  : "animate-slide-in-left"
              }`}
              dangerouslySetInnerHTML={{ __html: msg.text }}
            />
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 text-gray-200 px-5 py-3 rounded-2xl text-sm animate-pulse">
              <Loader2 className="w-5 h-5 inline animate-spin mr-2 text-[#00ff88]" />{" "}
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border border-[#00ff88] bg-[#1a1a1a] px-5 py-3 rounded-xl shadow-[0_0_5px_rgba(0,255,136,0.2)] focus:outline-none focus:ring-2 focus:ring-[#00ff88] transition-all text-gray-200 placeholder-gray-400"
          placeholder="Ask your trading coach..."
          aria-label="Chat input"
        />
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-[#00ff88] to-[#00cc70] text-black font-semibold px-6 py-3 rounded-xl shadow-[0_0_10px_#00ff88] hover:shadow-[0_0_15px_#00ff88] transition-all duration-200"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </main>
  );
}
