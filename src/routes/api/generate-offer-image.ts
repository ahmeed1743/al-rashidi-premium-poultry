import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { generateOfferImage } from "@/lib/image-gateway.server";

const Input = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(500).default(""),
  stream: z.boolean().default(true),
});

export const Route = createFileRoute("/api/generate-offer-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) return new Response("غير مصرح بإنشاء الصور", { status: 401 });

        const supabaseUrl = process.env["SUPABASE_URL"];
        const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!supabaseUrl || !publishableKey || !apiKey) return new Response("خدمة إنشاء الصور غير مفعلة حالياً", { status: 500 });

        const token = authHeader.slice(7);
        const supabase = createClient<Database>(supabaseUrl, publishableKey, {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
        const userId = claims?.claims?.sub;
        if (claimsError || !userId) return new Response("جلسة الدخول غير صالحة", { status: 401 });
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").limit(1);
        if (!roles?.length) return new Response("غير مسموح بإنشاء الصور", { status: 403 });

        let input: z.infer<typeof Input>;
        try {
          input = Input.parse(await request.json());
        } catch {
          return new Response("بيانات العرض غير صالحة", { status: 400 });
        }

        const prompt = [
          "صورة فوتوغرافية إعلانية مربعة عالية الجودة لعرض من متجر دواجن مصري.",
          `محتوى العرض: ${input.name}.`,
          input.description ? `التفاصيل: ${input.description}.` : "",
          "اعرض المنتجات المذكورة فقط بشكل طازج ونظيف ومرتب على سطح مطبخ احترافي، إضاءة تجارية مشرقة، ألوان طبيعية شهية، تكوين واضح مناسب لبطاقة منتج متجر إلكتروني.",
          "بدون أشخاص، بدون شعارات، بدون كتابة، بدون أسعار، بدون علامات مائية.",
        ].filter(Boolean).join(" ");

        const upstream = await generateOfferImage(apiKey, prompt, input.stream);
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") || (input.stream ? "text/event-stream" : "application/json"),
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});