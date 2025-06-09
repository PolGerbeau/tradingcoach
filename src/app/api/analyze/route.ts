import { NextRequest } from "next/server";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File;
  const profile = formData.get("profile") as string;

  if (!file) {
    return new Response("No file uploaded", { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64Image = Buffer.from(bytes).toString("base64");
  const profileObj = JSON.parse(profile);
  const chartImage = `data:image/png;base64,${base64Image}`;
  const now = new Date().toISOString();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: any) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      const jobs = [
        { fn: analyzeWithOpenAI, source: "OpenAI" },
        { fn: analyzeWithClaude, source: "Claude" },
        { fn: analyzeWithGemini, source: "Gemini" },
      ];

      for (const { fn, source } of jobs) {
        try {
          const raw = await withTimeout(fn(base64Image, profile), 90000);
          const analysis = {
            id: uuidv4(),
            date: now,
            chartImage,
            profileSnapshot: profileObj,
            source,
            ticker: extractField(raw, "Ticker"),
            price: extractField(raw, "Current price"),
            timeframe: extractField(raw, "Timeframe"),
            recommendation: extractField(raw, "Recommendation"),
            reasoning: extractField(raw, "Reasoning"),
            supportResistance: extractSupportResistance(raw),
          };
          send(analysis);
        } catch (err: any) {
          send({
            error: `Error analyzing with ${source}: ${err.message}`,
            source,
          });
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function analyzeWithOpenAI(
  base64Image: string,
  profile: string
): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
  return response.choices[0]?.message?.content || "";
}

async function analyzeWithClaude(
  base64Image: string,
  profile: string
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.CLAUDE_API_KEY!,
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
  return data.content?.[0]?.text || "[⚠️ No content returned from Claude]";
}

async function analyzeWithGemini(
  base64Image: string,
  profile: string
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inlineData: { mimeType: "image/png", data: base64Image } },
              { text: systemPrompt(profile) },
            ],
          },
        ],
      }),
    }
  );
  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "[⚠️ No content returned from Gemini]"
  );
}

function systemPrompt(profile: string): string {
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

function extractField(text: string, label: string): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `\\s*${escapedLabel}[:\\-\\s]+(.+?)(?=(\\r?\\n|\\n\\n|\\n\\-\\-|$))`,
    "i"
  );
  const match = text.match(regex);
  if (!match) return "";
  const result = match[1].trim();
  if (label.toLowerCase().includes("recommendation")) {
    const word = result.split(/\\s+/)[0].toUpperCase();
    return ["BUY", "SELL", "HOLD"].includes(word) ? word : "";
  }
  return result;
}

function extractSupportResistance(text: string): {
  level: string;
  type: "Support" | "Resistance";
  reason: string;
}[] {
  const regex = /(Support|Resistance)[:\s]*([0-9.]+)\s*[–-]\s*(.+)/gi;
  const matches = [...text.matchAll(regex)];
  return matches.map((m) => ({
    type: m[1] as "Support" | "Resistance",
    level: m[2],
    reason: m[3].trim(),
  }));
}
