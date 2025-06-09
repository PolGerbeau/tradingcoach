import { systemPrompt } from "./systemPrompt";

export async function analyzeWithGemini(
  base64Image: string,
  profile: string
): Promise<string> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
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
    }
  );

  const data = await res.json();
  console.log("📦 Gemini full response:\n", JSON.stringify(data, null, 2));
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "[⚠️ No content returned from Gemini]"
  );
}
