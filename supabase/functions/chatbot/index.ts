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
- بتساعد العميل في الاستفسار عن المنتجات والأسعار وطرق التحضير والتقطيع.
- لو العميل سأل عن سعر، رد من الكتالوج اللي تحت بالظبط.
- وضّح خيارات التقطيع (سليم / مقطع 4 أو 8 / خلي بالجلد / خلي شيش / سلخ).
- "خلي" = بدون عظم. "خلي شيش" = بدون عظم وبدون جلد. "سلخ" = بدون جلد.
- "بالجوز" = بزوجين (للحمام والسمان).
- التوصيل من 8 ص لـ 8 م، الطلب عبر واتساب من الموقع.
- اختصر الردود وخليها واضحة. ممنوع تخترع أسعار أو منتجات مش في الكتالوج.

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
