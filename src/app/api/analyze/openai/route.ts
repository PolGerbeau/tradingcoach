import { NextResponse } from "next/server";
import { analyzeWithOpenAI } from "@/analyze/openai";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File;
  const profile = formData.get("profile") as string;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64Image = Buffer.from(bytes).toString("base64");
  const profileObj = JSON.parse(profile);

  try {
    const raw = await analyzeWithOpenAI(base64Image, profile);

    const result = {
      id: uuidv4(),
      date: new Date().toISOString(),
      chartImage: `data:image/png;base64,${base64Image}`,
      profileSnapshot: profileObj,
      source: "OpenAI",
      ticker: extractField(raw, "Ticker"),
      price: extractField(raw, "Current price"),
      timeframe: extractField(raw, "Timeframe"),
      recommendation: extractField(raw, "Recommendation"),
      reasoning: extractField(raw, "Reasoning"),
      supportResistance: extractSupportResistance(raw),
    };

    return NextResponse.json({ analysis: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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
  const regex = /(Support|Resistance)[:\s]*\$?([0-9.]+)\s*[\u2013-]\s*(.+)/gi;
  const matches = [...text.matchAll(regex)];
  return matches.map((m) => ({
    type: m[1] as "Support" | "Resistance",
    level: m[2],
    reason: m[3].trim(),
  }));
}
