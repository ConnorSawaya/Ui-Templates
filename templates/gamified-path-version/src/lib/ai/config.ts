export type AIProvider = "openai" | "gemini" | "anthropic" | "demo";

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase() as AIProvider;
  if (provider && ["openai", "gemini", "anthropic", "demo"].includes(provider)) {
    return provider;
  }

  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";

  return "demo";
}

export function getApiKey(provider: AIProvider): string {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY || "";
    case "gemini":
      return process.env.GEMINI_API_KEY || "";
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY || "";
    default:
      return "";
  }
}

export function isDemoMode(): boolean {
  return getAIProvider() === "demo";
}
