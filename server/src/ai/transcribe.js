const GROQ_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";

async function groqTranscribe(buffer, mimeType) {
  if (!process.env.GROQ_API_KEY) return null;
  const form = new FormData();
  const ext = mimeType.includes("mp4") ? "m4a" : "ogg";
  form.append("file", new Blob([buffer], { type: mimeType }), `voice.${ext}`);
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "json");
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form
  });
  if (!res.ok) {
    console.error(`[transcribe] groq failed (${res.status}):`, (await res.text()).slice(0, 300));
    return null;
  }
  const data = await res.json();
  return data.text?.trim() || null;
}

async function geminiTranscribe(buffer, mimeType) {
  if (!process.env.GEMINI_API_KEY) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const res = await fetch(`${GEMINI_URL}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: "Transcribe this voice note exactly as spoken (Urdu, Roman Urdu, or English). Output only the transcript text." },
            { inlineData: { mimeType, data: buffer.toString("base64") } }
          ]
        }
      ]
    })
  });
  if (!res.ok) {
    console.error(`[transcribe] gemini failed (${res.status}):`, (await res.text()).slice(0, 300));
    return null;
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

export async function transcribeAudio(buffer, mimeType = "audio/ogg") {
  try {
    const groq = await groqTranscribe(buffer, mimeType);
    if (groq) return groq;
  } catch (err) {
    console.error("[transcribe] groq error:", err.message);
  }
  try {
    return await geminiTranscribe(buffer, mimeType);
  } catch (err) {
    console.error("[transcribe] gemini error:", err.message);
    return null;
  }
}
