import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File;
  const profile = formData.get("profile") as string;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64Image = Buffer.from(bytes).toString("base64");

  try {
    const gptRes = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
         content: `You are a trading coach assistant. Analyze the chart image and return:
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

Example:
Support: 152.30 – tested multiple times
Resistance: 158.00 – recent highs from May

Do not use parentheses or any other format. Always return Support/Resistance levels in this exact format so they can be extracted reliably.

Also consider the user's profile: ${profile}. Please return the response in plain text format only, without Markdown, bold, bullet points, or any additional formatting.`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const raw = gptRes.choices[0]?.message?.content || "";

    const now = new Date();
    const id = uuidv4();

    console.log("🔍 Raw GPT response ------------------ :", raw);

    const analysis = {
      id,
      date: now.toISOString(),
      chartImage: `data:image/png;base64,${base64Image}`,
      profileSnapshot: JSON.parse(profile),
      ticker: extractField(raw, "Ticker"),
      price: extractField(raw, "Current price"),
      timeframe: extractField(raw, "Timeframe"),
      recommendation: extractField(raw, "Recommendation"),
      reasoning: extractField(raw, "Reasoning"),
      supportResistance: extractSupportResistance(raw),
    };

    return NextResponse.json({ analysis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function extractField(text: string, label: string): string {
  const regex = new RegExp(
    `(?:\\*\\*${label}\\*\\*|${label})[:\\-\\s]+(.+?)(?=(\\r?\\n|\\n\\n|\\n\\-\\-|\\n\\*\\*|$))`,
    "is"
  );
  const match = text.match(regex);
  if (!match) return "";

  const result = match[1].trim();

  // Si es la recomendación, devuelve solo la primera palabra (BUY/SELL/HOLD)
  if (label.toLowerCase().includes("recommendation")) {
    const word = result.split(/\s+/)[0].toUpperCase();
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