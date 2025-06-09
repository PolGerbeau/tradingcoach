import { systemPrompt } from "./systemPrompt";

export async function analyzeWithClaude(
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
  console.log("📦 Claude full response:\n", JSON.stringify(data, null, 2));
  return data.content?.[0]?.text || "[⚠️ No content returned from Claude]";
}
