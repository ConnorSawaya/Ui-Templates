import { getAIProvider, isDemoMode, getApiKey } from "./config";
import { getDemoMenuAnalysis } from "./demoData";
import type { MenuAnalysis } from "../types";

export async function analyzeMenuText(
  text: string
): Promise<MenuAnalysis> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 1500));
    return getDemoMenuAnalysis(text);
  }

  const provider = getAIProvider();

  try {
    switch (provider) {
      case "openai":
        return await analyzeMenuWithOpenAI(text);
      case "gemini":
        return await analyzeMenuWithGemini(text);
      case "anthropic":
        return await analyzeMenuWithAnthropic(text);
      default:
        return getDemoMenuAnalysis(text);
    }
  } catch (error) {
    console.error(`Menu analysis failed with ${provider}:`, error);
    return getDemoMenuAnalysis(text);
  }
}

async function analyzeMenuWithOpenAI(text: string): Promise<MenuAnalysis> {
  const apiKey = getApiKey("openai");

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a menu analysis AI. Analyze the menu text and return JSON with this schema:
{
  "restaurantName": string | null,
  "items": [{ "name": string, "description": string, "likelyIngredients": string[], "estimatedNutrition": { "calories": number, "protein": number, "carbs": number, "fat": number }, "allergens": string[], "dietaryTags": string[], "healthScore": number (1-100) }]
}`,
          },
          { role: "user", content: text },
        ],
        max_tokens: 3000,
      }),
    }
  );

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response");
  return JSON.parse(content.replace(/```json|```/g, "").trim());
}

async function analyzeMenuWithGemini(text: string): Promise<MenuAnalysis> {
  const apiKey = getApiKey("gemini");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `Analyze this restaurant menu. Return JSON with restaurantName (or null) and items array containing name, description, likelyIngredients, estimatedNutrition (calories, protein, carbs, fat), allergens, dietaryTags, healthScore (1-100). Menu:\n\n${text}` },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) throw new Error("No response");
  return JSON.parse(textContent.replace(/```json|```/g, "").trim());
}

async function analyzeMenuWithAnthropic(text: string): Promise<MenuAnalysis> {
  const apiKey = getApiKey("anthropic");

  const response = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: `Analyze this restaurant menu. Return JSON with restaurantName (or null) and items array containing name, description, likelyIngredients, estimatedNutrition (calories, protein, carbs, fat), allergens, dietaryTags, healthScore (1-100). Menu:\n\n${text}`,
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const result = data.content?.[0]?.text;
  if (!result) throw new Error("No response");
  return JSON.parse(result.replace(/```json|```/g, "").trim());
}
