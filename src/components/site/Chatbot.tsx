import { useEffect, useRef, useState } from "react";
import { Send, X, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatbot`;

function buildCatalog() {
  const sectionLabels: Record<string, string> = {
    chicken: "فراخ", duck: "بط", turkey: "رومي", pigeon: "حمام وسمان",
    marinated: "متبلات", parts: "أجزاء", other: "أخرى",
  };
  const grouped: Record<string, string[]> = {};
  for (const p of PRODUCTS) {
    const k = sectionLabels[p.section] || p.section;
    grouped[k] = grouped[k] || [];
    const price = p.price ? `${p.price} ج` : "اتصل للسعر";
    const unit = p.pairUnit ? "/جوز" : "";
    const note = p.note ? ` (${p.note})` : "";
    grouped[k].push(`- ${p.name}: ${price}${unit}${note}`);
  }
  return Object.entries(grouped)
    .map(([k, arr]) => `### ${k}\n${arr.join("\n")}`)
    .join("\n\n");
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "أهلاً بيك في طيور الرشيدي 👋 اسألني عن أي منتج أو سعر أو طريقة تقطيع." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<string>("");

  useEffect(() => { catalogRef.current = buildCatalog(); }, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    let acc = "";
    setMessages((p) => [...p, { role: "assistant", content: "" }]);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, catalog: catalogRef.current }),
      });
      if (!resp.ok || !resp.body) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.error || "فشل الاتصال");
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (err: any) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: `عذراً، حصلت مشكلة: ${err.message || "حاول تاني"}` };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant transition-all hover:scale-110 md:bottom-6 md:left-6"
        aria-label="مساعد الرشيدي"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <Bot className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-black text-background">
            <Sparkles className="h-2.5 w-2.5" />
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 left-5 z-50 flex h-[70vh] max-h-[600px] w-[calc(100vw-2.5rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-gradient-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-black">مساعد الرشيدي</div>
                  <div className="text-[10px] opacity-90">يجاوبك عن أي سؤال</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/20"><X className="h-4 w-4" /></button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-bl-sm bg-secondary text-foreground"
                        : "rounded-br-sm bg-gradient-primary text-primary-foreground"
                    }`}
                  >
                    {m.content || (loading && i === messages.length - 1 ? "..." : "")}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-border bg-background p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="اسأل عن أي منتج..."
                className="flex-1 rounded-full bg-secondary px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
              <Button
                onClick={send}
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-full bg-gradient-primary p-0 text-primary-foreground"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
