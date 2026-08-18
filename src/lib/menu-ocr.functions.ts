import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ imageDataUrl: z.string().min(20) });

export type MenuItem = { name: string; price: number };

export const extractMenu = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<{ items: MenuItem[] }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI key missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "أنت مساعد يقرأ صور منيو محل دواجن مصري. استخرج كل الأصناف وأسعارها. أعد JSON فقط بالشكل: {\"items\":[{\"name\":\"اسم الصنف بالعربي\",\"price\":123}]} بدون أي شرح. السعر رقم بالجنيه فقط.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "استخرج الأصناف والأسعار من صورة المنيو دي." },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const json: any = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { items: [] };
    let parsed: any;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return { items: [] };
    }
    const items: MenuItem[] = (parsed?.items || [])
      .map((i: any) => ({ name: String(i?.name ?? "").trim(), price: Number(i?.price) || 0 }))
      .filter((i: MenuItem) => i.name && i.price > 0);
    return { items };
  });
