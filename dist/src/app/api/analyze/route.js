"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const openai_1 = __importDefault(require("openai"));
const uuid_1 = require("uuid");
// Utilidad para limitar duración de promesas
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));
    return Promise.race([promise, timeout]);
}
async function POST(req) {
    const formData = await req.formData();
    const file = formData.get("image");
    const profile = formData.get("profile");
    if (!file) {
        return server_1.NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const start = Date.now(); // ⏱️ Start timer
    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");
    const profileObj = JSON.parse(profile);
    const now = new Date();
    try {
        const [gptRaw, claudeRaw, geminiRaw] = await Promise.all([
            withTimeout(analyzeWithOpenAI(base64Image, profile), 90000),
            withTimeout(analyzeWithClaude(base64Image, profile), 90000),
            withTimeout(analyzeWithGemini(base64Image, profile), 90000),
        ]);
        console.log("🔍 Raw OpenAI response ------------------ :\n", gptRaw);
        console.log("🔍 Raw Claude response ------------------ :\n", claudeRaw);
        console.log("🔍 Raw Gemini response ------------------ :\n", geminiRaw);
        const analyses = [
            { raw: gptRaw, source: "OpenAI" },
            { raw: claudeRaw, source: "Claude" },
            { raw: geminiRaw, source: "Gemini" },
        ].map(({ raw, source }) => ({
            id: (0, uuid_1.v4)(),
            date: now.toISOString(),
            chartImage: `data:image/png;base64,${base64Image}`,
            profileSnapshot: profileObj,
            source,
            ticker: extractField(raw, "Ticker"),
            price: extractField(raw, "Current price"),
            timeframe: extractField(raw, "Timeframe"),
            recommendation: extractField(raw, "Recommendation"),
            reasoning: extractField(raw, "Reasoning"),
            supportResistance: extractSupportResistance(raw),
        }));
        const duration = Date.now() - start; // ⏱️ End timer
        console.log(`✅ Total analysis time: ${duration} ms`);
        return server_1.NextResponse.json({ analyses });
    }
    catch (err) {
        console.error("❌ Error in POST:", err);
        return server_1.NextResponse.json({ error: err.message }, { status: 500 });
    }
}
async function analyzeWithOpenAI(base64Image, profile) {
    var _a, _b;
    const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            { role: "system", content: systemPrompt(profile) },
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: { url: `data:image/png;base64,${base64Image}` },
                    },
                ],
            },
        ],
        max_tokens: 500,
    });
    return ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
}
async function analyzeWithClaude(base64Image, profile) {
    var _a, _b;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": process.env.CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            temperature: 0.5,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: "image/png",
                                data: base64Image,
                            },
                        },
                        { type: "text", text: systemPrompt(profile) },
                    ],
                },
            ],
        }),
    });
    const data = await res.json();
    console.log("📦 Claude full response:\n", JSON.stringify(data, null, 2));
    return ((_b = (_a = data.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) || "[⚠️ No content returned from Claude]";
}
async function analyzeWithGemini(base64Image, profile) {
    var _a, _b, _c, _d, _e;
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            inlineData: {
                                mimeType: "image/png",
                                data: base64Image,
                            },
                        },
                        {
                            text: systemPrompt(profile),
                        },
                    ],
                },
            ],
        }),
    });
    const data = await res.json();
    console.log("📦 Gemini full response:\n", JSON.stringify(data, null, 2));
    return (((_e = (_d = (_c = (_b = (_a = data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) ||
        "[⚠️ No content returned from Gemini]");
}
function systemPrompt(profile) {
    return `You are a trading coach assistant. Analyze the chart image and return:
- Ticker (if visible)
- Current price (if visible)
- Timeframe (e.g., 1D, 4H)
- Recommendation: BUY, SELL or HOLD
- Short reasoning for the decision
- Any patterns or signals observed (e.g., breakouts, consolidations, candle formations)
- Key support and resistance levels:

Format support and resistance as follows:
Support: [LEVEL] – [REASON]
Resistance: [LEVEL] – [REASON]

Do not use parentheses or any other format. Always return Support/Resistance levels in this exact format so they can be extracted reliably.

It is important to consider the user's profile: ${profile}. 
Imagine you're coaching this type of trader and adapt your analysis accordingly.
Please return the response in plain text format only, without Markdown, bold, bullet points, or any additional formatting.`;
}
function extractField(text, label) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\s*${escapedLabel}[:\\-\\s]+(.+?)(?=(\\r?\\n|\\n\\n|\\n\\-\\-|$))`, "i");
    const match = text.match(regex);
    if (!match)
        return "";
    const result = match[1].trim();
    if (label.toLowerCase().includes("recommendation")) {
        const word = result.split(/\s+/)[0].toUpperCase();
        return ["BUY", "SELL", "HOLD"].includes(word) ? word : "";
    }
    return result;
}
function extractSupportResistance(text) {
    const regex = /(Support|Resistance)[:\s]*([0-9.]+)\s*[–-]\s*(.+)/gi;
    const matches = [...text.matchAll(regex)];
    return matches.map((m) => ({
        type: m[1],
        level: m[2],
        reason: m[3].trim(),
    }));
}
