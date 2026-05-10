import type { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function HScroll({
  title, products, viewAllTo, eyebrow,
}: {
  title: string;
  products: Product[];
  viewAllTo: string;
  eyebrow?: React.ReactNode;
}) {
  if (products.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          {eyebrow}
          <h2 className="text-2xl font-black md:text-3xl">{title}</h2>
        </div>
        <Link
          to={viewAllTo}
          className="inline-flex items-center gap-1 rounded-full bg-secondary/50 px-4 py-2 text-xs font-bold transition-colors hover:bg-secondary md:text-sm"
        >
          عرض الكل <ArrowLeft className="h-3 w-3" />
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <div className="flex gap-4 pb-2">
          {products.map((p) => (
            <div key={p.id} className="w-[200px] flex-none md:w-[240px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
