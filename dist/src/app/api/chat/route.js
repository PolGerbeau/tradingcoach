"use strict";
// src/app/api/chat/route.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const openai_1 = __importDefault(require("openai"));
async function POST(req) {
    var _a;
    try {
        console.log("OPENAI KEY:", process.env.OPENAI_API_KEY);
        const openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const { profile, history = [], pastAnalyses = [], message, } = await req.json();
        if (!message || typeof message !== "string") {
            return server_1.NextResponse.json({ error: "Missing or invalid 'message'" }, { status: 400 });
        }
        const fullPrompt = `
You are a professional trading coach.º
You help the user improve their trading decisions using their own profile, analysis history, and conversation context.
Only respond to trading-related questions. If the user asks about anything else, kindly remind them this coach is only for trading.
Do not prefix your messages with "Coach:" or similar labels. Just speak directly to the user in a natural tone.

If the user asks how to analyze a chart, or requests a chart analysis, tell the user:
"Sure! To analyze a chart, please upload a screenshot of your trading chart (e.g. from TradingView) using _UPLOAD_LINK_. Once uploaded, I’ll give you a personalized breakdown."

Use _UPLOAD_LINK_ exactly like that — the frontend will replace it with the real URL.

Consider the user’s emotional state and trading psychology—offer encouragement for successes or advice to manage fear/greed based on their history. Suggest strategy tweaks if past trades show patterns (e.g., losses from poor timing). Provide performance feedback (e.g., win rate, trends) when relevant, and encourage goal-setting.

On chart upload, inspect the Analysis list to confirm the new entry is present.

User profile:
${JSON.stringify(profile, null, 2)}

Conversation history:
${history
            .map((m) => `${m.role === "user" ? "User" : "Coach"}: ${m.text}`)
            .join("\n")}

Past chart analyses:
${pastAnalyses.length > 0
            ? pastAnalyses
                .map((entry, i) => {
                return `Analysis ${i + 1} – ${entry.ticker} (${entry.timeframe}) on ${entry.date}:
Recommendation: ${entry.recommendation}
Reasoning: ${entry.reasoning}`;
            })
                .join("\n\n")
            : "None"}

Latest user message:
"${message}"
    `.trim();
        const chatResponse = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: fullPrompt,
                },
            ],
            model: "gpt-4.1-mini",
            temperature: 0.7,
        });
        const reply = (_a = chatResponse.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.trim();
        return server_1.NextResponse.json({ reply });
    }
    catch (err) {
        console.error("Error in /api/chat:", err);
        return server_1.NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
