"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function TradingCoachChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [pastAnalyses, setPastAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("tradingcoach_profile");
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    const savedAnalyses = localStorage.getItem("tradingcoach_history");
    if (savedAnalyses) {
      try {
        setPastAnalyses(JSON.parse(savedAnalyses));
      } catch (e) {
        console.error("Invalid analysis history in localStorage");
      }
    }

    const savedMessages = localStorage.getItem("tradingcoach_chat");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Invalid chat history in localStorage");
      }
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    localStorage.setItem("tradingcoach_chat", JSON.stringify(messages));
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
      text: data.reply?.replace(
        /_UPLOAD_LINK_/g,
        '<a href="/upload" class="text-blue-600 underline">this page</a>'
      ),
    });
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
      localStorage.removeItem("tradingcoach_chat");
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 relative">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">Trading Coach</h1>

      <button
        onClick={clearChat}
        className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-sm text-sm"
      >
        Clear Chat
      </button>

      <div
        ref={chatRef}
        className="bg-white rounded-xl border border-gray-300 h-[500px] overflow-y-auto px-6 py-4 shadow-sm mb-6 space-y-4"
      >
        {messages.length === 0 && (
          <p className="text-gray-500 italic text-center mt-24 text-gray-900">
            Ask your trading coach...
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "user" ? (
              <div className="max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-line bg-blue-100 text-blue-900">
                {msg.text}
              </div>
            ) : (
              <div
                className="max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-line bg-gray-100 text-gray-800"
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl text-sm animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-gray-900"
          placeholder="Ask your trading coach..."
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-xl transition"
        >
          Send
        </button>
      </div>
    </main>
  );
}
