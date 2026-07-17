import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

export function geminiModel(opts = {}) {
  return new ChatGoogleGenerativeAI({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.3,
    maxRetries: 0,
    ...opts
  });
}

export function groqModel(opts = {}) {
  return new ChatGroq({
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.3,
    maxRetries: 0,
    ...opts
  });
}

// run(model) is executed against Gemini first, then Groq. Throws only if both fail.
export async function invokeWithFallback(run, opts = {}) {
  const providers = [
    ["gemini", geminiModel],
    ["groq", groqModel]
  ];
  let lastErr;
  for (const [name, factory] of providers) {
    try {
      return await run(factory(opts));
    } catch (err) {
      lastErr = err;
      console.error(`[ai] ${name} failed (${err.status || err.code || "err"}): ${err.message}`);
    }
  }
  throw lastErr;
}
