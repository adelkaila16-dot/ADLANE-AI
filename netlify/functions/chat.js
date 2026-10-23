"use strict";

const MAX_MESSAGE_LENGTH = 10000;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

exports.handler = async (event = {}) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "طريقة الطلب غير مدعومة." }, { Allow: "POST" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    return jsonResponse(500, { error: "خدمة المحادثة غير مهيأة في Netlify." });
  }

  let body;
  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : event.body || "{}";
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse(400, { error: "تعذّرت قراءة الرسالة." });
  }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) {
    return jsonResponse(400, { error: "اكتب رسالة أولاً." });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse(413, { error: "الرسالة طويلة جداً. اختصرها ثم حاول مجدداً." });
  }

  try {
    const geminiResponse = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: "أنت ADLANE AI، مساعد مهذب ومفيد. أجب بالعربية الفصحى الواضحة، ويمكنك استخدام الدارجة الجزائرية عندما تكون مناسبة. إذا طلب المستخدم صراحةً لغة أخرى أو ترجمة، اتبع طلبه. لا تدّع تنفيذ أفعال خارج المحادثة."
          }]
        },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
      })
    });

    const data = await geminiResponse.json().catch(() => null);
    if (!geminiResponse.ok) {
      const statusCode = geminiResponse.status === 429 ? 429 : 502;
      const error = geminiResponse.status === 429
        ? "الخدمة مشغولة الآن. انتظر قليلاً ثم حاول مجدداً."
        : "تعذّر الحصول على إجابة من المساعد الآن.";
      return jsonResponse(statusCode, { error });
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part) => typeof part.text === "string" ? part.text : "")
      .join("")
      .trim();
    if (!reply) {
      return jsonResponse(502, { error: "لم تصل إجابة من المساعد. حاول مرة أخرى." });
    }

    return jsonResponse(200, { reply });
  } catch {
    return jsonResponse(502, { error: "تعذّر الاتصال بالمساعد الآن." });
  }
};

function jsonResponse(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extraHeaders
    },
    body: JSON.stringify(payload)
  };
}
