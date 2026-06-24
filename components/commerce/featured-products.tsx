"use client";

import { ProductCard } from "@/components/commerce/product-card";
import { useProducts } from "@/components/providers/product-provider";

export function FeaturedProducts() {
  const { products, loading } = useProducts();

  if (loading) {
    return <p className="text-sm text-black/60">Loading featured products...</p>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-3 [&_article]:border-black/10 [&_article]:bg-black/[0.03] [&_article_a]:text-black [&_article_p]:text-black/65 [&_button]:text-black">
      {products.slice(0, 3).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
