"use strict";
// app/chat/page.tsx
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TradingCoachChat;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
function TradingCoachChat() {
    // Inicializa messages desde localStorage solo una vez
    const initialMessages = typeof window !== "undefined"
        ? localStorage.getItem("tradingcoach_chat")
        : null;
    const [messages, setMessages] = (0, react_1.useState)(initialMessages ? JSON.parse(initialMessages) : []);
    const [input, setInput] = (0, react_1.useState)("");
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [pastAnalyses, setPastAnalyses] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const chatRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        console.log("Loading initial data - Messages:", messages); // Solo para depuración
        const savedProfile = localStorage.getItem("tradingcoach_profile");
        if (savedProfile) {
            try {
                setProfile(JSON.parse(savedProfile));
            }
            catch (e) {
                console.error("Invalid profile data:", e);
            }
        }
        const savedAnalyses = localStorage.getItem("tradingcoach_history");
        if (savedAnalyses) {
            try {
                setPastAnalyses(JSON.parse(savedAnalyses));
            }
            catch (e) {
                console.error("Invalid analysis history:", e);
            }
        }
    }, []);
    (0, react_1.useEffect)(() => {
        console.log("Saving messages to localStorage:", messages);
        localStorage.setItem("tradingcoach_chat", JSON.stringify(messages));
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);
    const addMessage = (msg) => {
        setMessages((prev) => [...prev, msg]);
    };
    const handleSubmit = async () => {
        var _a;
        console.log("Before submit, messages:", messages);
        if (!input.trim())
            return;
        const userMessage = { role: "user", text: input };
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
        console.log("API response:", data);
        addMessage({
            role: "assistant",
            text: ((_a = data.reply) === null || _a === void 0 ? void 0 : _a.replace(/_UPLOAD_LINK_/g, '<a href="/upload" class="text-blue-600 underline">this page</a>')) || "No response from coach.",
        });
        setLoading(false);
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter")
            handleSubmit();
    };
    const clearChat = () => {
        if (window.confirm("Are you sure you want to clear the conversation?")) {
            console.log("Clearing chat, messages before:", messages);
            setMessages([]);
            localStorage.removeItem("tradingcoach_chat");
        }
    };
    return (<main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 min-h-screen relative">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-6 flex items-center gap-2">
        <lucide_react_1.MessageCircle className="w-8 h-8 text-blue-600"/>
        Trading Coach
      </h1>

      <button onClick={clearChat} className="absolute top-6 right-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-200 text-sm" aria-label="Clear chat">
        Clear Chat
      </button>

      <div ref={chatRef} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 h-[600px] sm:h-[500px] overflow-y-auto px-6 py-4 shadow-xl mb-6 space-y-4 animate-fade-in">
        {messages.length === 0 && (<div className="flex flex-col items-center justify-center h-full text-center">
            <lucide_react_1.MessageCircle className="w-16 h-16 text-gray-400 mb-4 animate-pulse"/>
            <p className="text-gray-500 italic text-lg">
              Start chatting with your trading coach...
            </p>
          </div>)}

        {messages.map((msg, i) => (<div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm whitespace-pre-line transition-all duration-300 ${msg.role === "user"
                ? "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-900"
                : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800"} ${msg.role === "user"
                ? "animate-slide-in-right"
                : "animate-slide-in-left"}`} dangerouslySetInnerHTML={{ __html: msg.text }}/>
          </div>))}

        {loading && (<div className="flex justify-start">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 px-5 py-3 rounded-2xl text-sm animate-pulse">
              <lucide_react_1.Loader2 className="w-5 h-5 inline animate-spin mr-2"/>{" "}
              Thinking...
            </div>
          </div>)}
      </div>

      <div className="flex gap-3 items-center">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 border border-gray-200 bg-white px-5 py-3 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-900 placeholder-gray-400" placeholder="Ask your trading coach..." aria-label="Chat input"/>
        <button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200" aria-label="Send message">
          Send
        </button>
      </div>
    </main>);
}
