import { getAIProvider, isDemoMode, getApiKey } from "./config";
import { getDemoFoodAnalysis } from "./demoData";
import type { FoodAnalysis } from "../types";

export async function analyzeFoodImage(
  imageDataUrl: string
): Promise<FoodAnalysis> {
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 2000));
    return getDemoFoodAnalysis(imageDataUrl);
  }

  const provider = getAIProvider();

  try {
    switch (provider) {
      case "openai":
        return await analyzeWithOpenAI(imageDataUrl);
      case "gemini":
        return await analyzeWithGemini(imageDataUrl);
      case "anthropic":
        return await analyzeWithAnthropic(imageDataUrl);
      default:
        return getDemoFoodAnalysis(imageDataUrl);
    }
  } catch (error) {
    console.error(`AI analysis failed with ${provider}:`, error);
    return getDemoFoodAnalysis(imageDataUrl);
  }
}

async function analyzeWithOpenAI(
  imageDataUrl: string
): Promise<FoodAnalysis> {
  const apiKey = getApiKey("openai");
  const base64 = imageDataUrl.split(",")[1];

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
            content: `You are a food analysis AI. Analyze the food image and return a JSON object with this exact schema:
{
  "dishName": string,
  "confidence": number (0-1),
  "summary": string,
  "ingredients": [{ "name": string, "category": string, "estimatedQuantity": string, "calories": number, "allergens": string[], "notes": string, "substitutions": string[] }],
  "nutrition": { "calories": number, "protein": number, "carbs": number, "fat": number, "sodium": number, "sugar": number },
  "dietaryTags": string[],
  "allergenWarnings": string[],
  "healthScore": number (1-100),
  "hiddenIngredients": string[],
  "confidenceNotes": string
}`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image in detail.",
              },
              {
                type: "image_url",
                image_url: { url: imageDataUrl, detail: "high" },
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    }
  );

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
  return { ...parsed, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
}

async function analyzeWithGemini(
  imageDataUrl: string
): Promise<FoodAnalysis> {
  const apiKey = getApiKey("gemini");
  const base64 = imageDataUrl.split(",")[1];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Analyze this food image. Return JSON with dishName, confidence, summary, ingredients (name, category, estimatedQuantity, calories, allergens, notes, substitutions), nutrition (calories, protein, carbs, fat, sodium, sugar), dietaryTags, allergenWarnings, healthScore (1-100), hiddenIngredients, confidenceNotes." },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from Gemini");

  const json = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(json);
  return { ...parsed, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
}

async function analyzeWithAnthropic(
  imageDataUrl: string
): Promise<FoodAnalysis> {
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
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image. Return JSON with dishName, confidence, summary, ingredients (name, category, estimatedQuantity, calories, allergens, notes, substitutions), nutrition (calories, protein, carbs, fat, sodium, sugar), dietaryTags, allergenWarnings, healthScore (1-100), hiddenIngredients, confidenceNotes.",
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageDataUrl.split(",")[1],
                },
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("No response from Anthropic");

  const json = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(json);
  return { ...parsed, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
}
