exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: headers(), body: "" };
  if (event.httpMethod !== "POST") return reply(405, { error: "Method not allowed" });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return reply(500, { error: "GEMINI_API_KEY is not configured in Netlify." });
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return reply(400, { error: "Invalid JSON body." }); }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return reply(400, { error: "Message is required." });
  if (message.length > 10000) return reply(413, { error: "Message is too long." });
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: "أنت ADLANE AI، مساعد ذكي مهذب ومفيد. أجب بلغة المستخدم، وفضّل العربية والدارجة الجزائرية عند استعمالهما. لا تدّعِ أنك نفذت أفعالاً خارج المحادثة." }] }, contents: [{ role: "user", parts: [{ text: message }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1200 } })
    });
    const data = await r.json();
    if (!r.ok) return reply(502, { error: data?.error?.message || "Gemini request failed." });
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!text) return reply(502, { error: "Gemini returned an empty response." });
    return reply(200, { reply: text });
  } catch { return reply(502, { error: "Could not reach Gemini service." }); }
};
function headers() { return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json; charset=utf-8" }; }
function reply(statusCode, data) { return { statusCode, headers: headers(), body: JSON.stringify(data) }; }
    
