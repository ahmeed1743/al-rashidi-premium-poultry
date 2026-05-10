import { MessageCircle, Headphones } from "lucide-react";

export function WhatsappFloat() {
  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col gap-3">
      <a
        href="https://wa.me/201038319460?text=%D8%B4%D9%83%D9%88%D9%89%20%D8%A3%D9%88%20%D8%A7%D9%82%D8%AA%D8%B1%D8%A7%D8%AD"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-gold text-background shadow-elegant transition-transform hover:scale-110"
        aria-label="شكاوى واقتراحات"
      >
        <Headphones className="h-5 w-5" />
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-card px-3 py-1 text-xs font-bold shadow-card group-hover:block">
          شكاوى واقتراحات
        </span>
      </a>
      <a
        href="https://wa.me/201223381405"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elegant transition-transform hover:scale-110 animate-float"
        aria-label="واتساب الطلبات"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30" />
      </a>
    </div>
  );
}
