import OpenAI from "openai";
import { systemPrompt } from "./systemPrompt";

export async function analyzeWithOpenAI(
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
