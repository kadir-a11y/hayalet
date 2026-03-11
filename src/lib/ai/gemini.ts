import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateContent(prompt: string, model = "gemini-2.0-flash-lite") {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return response.text || "";
}
