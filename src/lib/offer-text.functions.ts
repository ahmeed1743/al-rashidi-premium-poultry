import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ text: z.string().trim().min(10).max(30_000) });

export type ExtractedOffer = {
  name: string;
  description: string;
  price: number;
};

type GatewayEvent = {
  type?: string;
  delta?: string;
  error?: { message?: string };
  response?: { output_text?: string };
};

function parseOffers(text: string): ExtractedOffer[] {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const objectText = fenced ?? text.match(/\{[\s\S]*\}/)?.[0] ?? "";
  if (!objectText) return [];

  try {
    const parsed = JSON.parse(objectText) as { offers?: unknown[] };
    return (parsed.offers ?? [])
      .map((value) => {
        const item = value as Record<string, unknown>;
        return {
          name: String(item.name ?? "").trim(),
          description: String(item.description ?? "").trim(),
          price: Number(item.price) || 0,
        };
      })
      .filter((item) => item.name && item.price > 0);
  } catch {
    return [];
  }
}

export const extractOffersFromText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }): Promise<{ offers: ExtractedOffer[] }> => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .limit(1);
    if (!roles?.length) throw new Error("غير مسموح باستخدام أداة العروض");

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("خدمة الذكاء الاصطناعي غير مفعلة حالياً");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
        instructions:
          "أنت مسؤول إدخال عروض لمحل دواجن مصري. حوّل رسالة واتساب إلى عروض منفصلة. كل سعر ظاهر يمثل عرضاً واحداً. احتفظ بالكميات والأوزان والنوع والحجم في اسم عربي واضح وقصير. العروض المركبة مثل فرخة مع نصف كيلو بانية تظل عرضاً واحداً. لا تخترع سعراً أو سعراً قديماً. أعد JSON فقط بالشكل {\"offers\":[{\"name\":\"اسم العرض\",\"description\":\"تفاصيل مختصرة\",\"price\":123}]}. تجاهل الفواصل والزخارف والرموز التي لا تضيف معنى.",
        input: [{ role: "user", content: [{ type: "input_text", text: data.text }] }],
      }),
    });

    if (!response.ok) {
      const message = (await response.text()).slice(0, 500);
      throw new Error(message || `تعذر تحليل العروض (${response.status})`);
    }
    if (!response.body) throw new Error("لم يصل رد من خدمة تحليل العروض");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let output = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;
          let event: GatewayEvent;
          try {
            event = JSON.parse(raw) as GatewayEvent;
          } catch {
            continue;
          }
          if (event.type === "error") throw new Error(event.error?.message || "تعذر تحليل العروض");
          if (event.type === "response.output_text.delta" && event.delta) output += event.delta;
          if (event.type === "response.completed" && !output && event.response?.output_text) {
            output = event.response.output_text;
          }
        }
      }
    }

    const offers = parseOffers(output);
    if (!offers.length) throw new Error("لم أتمكن من استخراج عروض واضحة. راجع النص وحاول مرة أخرى.");
    return { offers };
  });