"use client";

import { Trash2 } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { useCart } from "@/components/providers/cart-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Container, Section } from "@/components/ui/section";
import { formatPrice } from "@/lib/format";
import { getProductById } from "@/lib/store";

export default function ComparePage() {
  const { compare, clearCompare } = useCart();
  const products = compare.map((id) => getProductById(id)).filter((product) => Boolean(product));

  return (
    <Section>
      <Container>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-zeib-soft-gold">Compare</p>
            <h1 className="mt-2 font-serif text-4xl font-bold">Product Comparison</h1>
            <p className="mt-3 max-w-2xl text-white/65">Compare up to three ZEIB SHOES products side by side.</p>
          </div>
          {products.length ? (
            <Button variant="secondary" onClick={clearCompare}>
              <Trash2 className="h-4 w-4" /> Clear compare
            </Button>
          ) : null}
        </div>

        {products.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No products selected" body="Use the Compare button on product cards or product detail pages." />
            <LinkButton href="/products" className="mt-5">Browse products</LinkButton>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {products.map((product) => product && <ProductCard key={product.id} product={product} />)}
            </div>
            <div className="mt-8 overflow-hidden rounded-md border border-white/10">
              {["Category", "Price", "Rating", "Stock", "Sizes", "Colors"].map((row) => (
                <div key={row} className="grid gap-3 border-b border-white/10 bg-white/[0.04] p-4 last:border-0 md:grid-cols-[160px_repeat(3,1fr)]">
                  <p className="font-semibold text-zeib-soft-gold">{row}</p>
                  {products.map((product) => {
                    if (!product) return null;
                    const value =
                      row === "Category"
                        ? product.category
                        : row === "Price"
                          ? formatPrice(product.price)
                          : row === "Rating"
                            ? `${product.rating}/5`
                            : row === "Stock"
                              ? `${product.stock} available`
                              : row === "Sizes"
                                ? product.sizes.join(", ")
                                : product.colors.join(", ");
                    return <p key={`${product.id}-${row}`} className="text-sm text-white/70">{value}</p>;
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
