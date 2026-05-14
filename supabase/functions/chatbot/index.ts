// Lovable AI–powered customer chatbot for طيور الرشيدي
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages, catalog } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const sys = `أنت "مساعد طيور الرشيدي" — مساعد ذكي ودود بتتكلم مصري بسيط.
- بتساعد العميل في كل حاجة: المنتجات، الأسعار، التقطيع، التوصيل، الفروع، طرق التواصل.
- لو العميل سأل عن سعر، رد من الكتالوج اللي تحت بالظبط. ممنوع تخترع أسعار أو منتجات مش في الكتالوج.
- لو السعر مكتوب 0 أو "اتصل للسعر"، اطلب من العميل يتصل على رقم الطلبات.
- وضّح خيارات التقطيع (سليم / مقطع 4 أو 8 / خلي بالجلد / خلي شيش / سلخ).
- "خلي" = بدون عظم. "خلي شيش" = بدون عظم وبدون جلد. "سلخ" = بدون جلد. "بالجوز" = بزوجين (للحمام والسمان).
- لو حد عايز يقدم شكوى، اديله رقم الشكاوى مباشرة.
- لو حد سأل عن السوشيال ميديا، شارك اللينكات.
- اختصر الردود وخليها واضحة وودودة. استخدم Markdown (روابط/تعداد) لما يساعد.

🏬 *الفروع — الإسكندرية*:

1) **الفرع الرئيسي - كامب شيزار**
   - الموقع: https://maps.app.goo.gl/7dN6WUnmkbq5kWK27
   - أرقام: 035900717 / 035927195 / 01223381405 / 01099342344
   - واتساب: https://wa.me/201223381405
   - فيسبوك: https://www.facebook.com/TyorElrshedy

2) **فرع سموحة**
   - أرقام: 4261199 / 01226151455 / 01018532722
   - واتساب: https://wa.me/201226151455
   - فيسبوك: https://www.facebook.com/Tyor.Elrshedy.Smouha

3) **فرع جناكليس**
   - تليفون: 01099342344
   - واتساب: https://wa.me/201099342344
   - فيسبوك: https://www.facebook.com/elrshedi

📣 *شكاوى واقتراحات*: 01038319460 — واتساب: https://wa.me/201038319460

🕒 *المواعيد*: من 8 صباحاً إلى 8 مساءً يومياً.

💳 *الدفع*: كاش عند الاستلام أو Instapay.

📋 *الكتالوج الحالي*:
${catalog || "(غير متاح)"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, ...(messages || [])],
        stream: true,
      }),
    });

    if (response.status === 429)
      return new Response(JSON.stringify({ error: "Rate limit. حاول بعد دقيقة." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (response.status === 402)
      return new Response(JSON.stringify({ error: "نفذ الرصيد." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chatbot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
