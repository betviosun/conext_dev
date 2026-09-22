import { assistSystemPrompt } from "./businessKnowledge.js";

function getConfig() {
  return {
    apiKey: (process.env.OPENAI_API_KEY || "").trim(),
    baseUrl: (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    model: (process.env.OPENAI_MODEL || "gpt-4o-mini").trim()
  };
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .slice(-12)
    .map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      content: String(item?.content || "").trim().slice(0, 2000)
    }))
    .filter((item) => item.content);
}

export async function generateAssistReply(rawMessages) {
  const { apiKey, baseUrl, model } = getConfig();

  if (!apiKey) {
    const error = new Error("Assist chat is not configured. Add OPENAI_API_KEY to server/.env.");
    error.status = 503;
    throw error;
  }

  const messages = normalizeMessages(rawMessages);
  if (!messages.length) {
    const error = new Error("Please enter a message.");
    error.status = 400;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Recommended by OpenRouter for ranking / app identity
        "HTTP-Referer": process.env.FRONTEND_ORIGIN || "http://localhost:3000",
        "X-Title": "CoNext Assist"
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 450,
        messages: [{ role: "system", content: assistSystemPrompt }, ...messages]
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = payload?.error?.message || `OpenRouter request failed (${response.status})`;
      const error = new Error(detail);
      error.status = 502;
      throw error;
    }

    const reply = payload?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      const error = new Error("No response was generated. Please try again.");
      error.status = 502;
      throw error;
    }

    return reply;
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("OpenRouter request timed out. Check your network and try again.");
      timeoutError.status = 504;
      throw timeoutError;
    }
    if (error?.cause?.code === "UND_ERR_CONNECT_TIMEOUT" || error?.message === "fetch failed") {
      const networkError = new Error("Could not reach OpenRouter. Check internet/VPN/firewall and try again.");
      networkError.status = 504;
      throw networkError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
