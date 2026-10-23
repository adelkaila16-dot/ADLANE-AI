"use strict"; send message 

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
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0b0712">
<title>ADLANE AI — ذكاؤك، عالمك</title>
<style>
:root{--bg:#09070e;--panel:#14101d;--panel2:#1c1528;--purple:#8d5cff;--gold:#e9c46a;--muted:#b7aec8;--line:#332744;--white:#faf7ff}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 80% 0%,#25123c 0,transparent 42%),var(--bg);color:var(--white);font-family:system-ui,-apple-system,"Segoe UI",Tahoma,Arial,sans-serif;min-height:100vh}
button,input,textarea,select{font:inherit}button{cursor:pointer}
.wrap{max-width:1180px;margin:auto;padding:0 20px}
header{display:flex;align-items:center;justify-content:space-between;padding:20px 0;border-bottom:1px solid #ffffff12;gap:14px}
.brand{display:flex;align-items:center;gap:12px;font-weight:900;font-size:22px;letter-spacing:.4px}.logo{width:44px;height:44px;border-radius:14px;background:linear-gradient(145deg,var(--gold),#9b6c24);color:#140c1c;display:grid;place-items:center;font-size:24px;box-shadow:0 0 28px #e9c46a28}
.brand small{display:block;color:var(--muted);font-size:11px;font-weight:500;letter-spacing:0}
.top-actions{display:flex;gap:10px}.btn{border:1px solid var(--line);background:#ffffff08;color:var(--white);padding:10px 15px;border-radius:12px}.btn.primary{background:linear-gradient(135deg,var(--purple),#6534bf);border:0;box-shadow:0 8px 25px #8d5cff2c}.hero{padding:54px 0 34px;text-align:center}.badge{display:inline-flex;align-items:center;gap:8px;border:1px solid #8d5cff55;background:#8d5cff12;color:#d9c8ff;border-radius:999px;padding:7px 13px;font-size:13px}
h1{font-size:clamp(34px,6vw,62px);line-height:1.16;margin:18px 0 12px;font-weight:900;letter-spacing:-1.5px}h1 span{background:linear-gradient(90deg,#f6dc8f,#a985ff);color:transparent;background-clip:text}.sub{max-width:650px;margin:0 auto;color:var(--muted);font-size:17px;line-height:1.9}
.hero-actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:24px}.hero-actions .btn{padding:13px 20px}
.layout{display:grid;grid-template-columns:245px minmax(0,1fr);gap:18px;padding:18px 0 46px}.sidebar,.maincard,.feature{background:linear-gradient(180deg,#17111fef,#100c17f5);border:1px solid var(--line);border-radius:20px}
.sidebar{padding:14px;height:max-content;position:sticky;top:12px}.side-title{font-size:12px;color:#8e819f;padding:8px 10px}.nav{display:flex;flex-direction:column;gap:6px}.nav button{border:0;text-align:right;padding:12px;border-radius:12px;background:transparent;color:#d8d0e5;display:flex;gap:10px;align-items:center}.nav button.active,.nav button:hover{background:#8d5cff22;color:#fff}.nav .ico{width:27px;text-align:center;font-size:18px}.sidebar-note{margin-top:20px;border-top:1px solid var(--line);padding:14px 8px;color:var(--muted);font-size:12px;line-height:1.8}
.maincard{overflow:hidden;min-height:490px}.card-head{padding:22px 24px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:10px}.card-head h2{margin:0;font-size:21px}.status{color:#92e6bd;font-size:12px}.content{padding:22px}.welcome{padding:20px;border-radius:16px;background:linear-gradient(125deg,#8d5cff1d,#e9c46a0c);border:1px solid #8d5cff2c;margin-bottom:18px}.welcome h3{margin:0 0 8px;font-size:20px}.welcome p{margin:0;color:var(--muted);line-height:1.8}
.quick{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.feature{padding:17px;text-align:right;color:var(--white);transition:.2s;min-height:112px}.feature:hover{transform:translateY(-2px);border-color:#8d5cff99}.feature strong{display:block;margin:8px 0 5px}.feature span{font-size:13px;color:var(--muted);line-height:1.6}.feature .big{font-size:23px}
.chatbox{display:flex;flex-direction:column;gap:12px}.messages{display:flex;flex-direction:column;gap:12px;min-height:180px;max-height:290px;overflow:auto;padding:4px}.msg{padding:12px 14px;border-radius:14px;line-height:1.8;max-width:92%;white-space:pre-wrap}.msg.ai{background:#ff
