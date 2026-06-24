/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { GitCompare, Heart, Share2, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, toggleWishlist, isWishlisted, toggleCompare, isCompared } = useCart();
  const [status, setStatus] = useState("");

  function flashStatus(message: string) {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 1800);
  }

  return (
    <article className="group overflow-hidden rounded-md border border-white/10 bg-white/[0.04]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-white/5">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.isNew ? <span className="rounded bg-zeib-gold px-2 py-1 text-xs font-bold text-black">New</span> : null}
          {product.oldPrice ? <span className="rounded bg-white px-2 py-1 text-xs font-bold text-black">Sale</span> : null}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zeib-soft-gold">{product.category}</p>
            <Link href={`/products/${product.slug}`} className="mt-1 block font-semibold hover:text-zeib-soft-gold">
              {product.name}
            </Link>
          </div>
          <Button
            variant="ghost"
            className="h-9 w-9 shrink-0 p-0"
            onClick={() => {
              toggleWishlist(product.id);
              flashStatus(isWishlisted(product.id) ? "Removed from wishlist." : "Added to wishlist.");
            }}
            aria-label="Toggle wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-zeib-gold text-zeib-gold" : ""}`} />
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm text-white/70">
          <Star className="h-4 w-4 fill-zeib-gold text-zeib-gold" />
          <span>{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-bold text-white">{formatPrice(product.price)}</span>
          {product.oldPrice ? <span className="text-sm text-white/45 line-through">{formatPrice(product.oldPrice)}</span> : null}
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <Button
            className="w-full"
            onClick={() => {
              addItem({
                productId: product.id,
                quantity: 1,
                size: product.sizes[0],
                color: product.colors[0]
              });
              flashStatus("Added to cart.");
            }}
          >
            Add to cart
          </Button>
          <Button
            variant="secondary"
            className="h-11 w-11 p-0"
            onClick={() => navigator.share?.({ title: product.name, url: `/products/${product.slug}` })}
            aria-label="Share product"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="secondary"
          className="mt-2 w-full"
          onClick={() => {
            toggleCompare(product.id);
            flashStatus(isCompared(product.id) ? "Removed from compare." : "Added to compare.");
          }}
        >
          <GitCompare className="h-4 w-4" /> {isCompared(product.id) ? "Compared" : "Compare"}
        </Button>
        {status ? <p className="mt-2 text-xs text-green-300">{status}</p> : null}
      </div>
    </article>
  );
}
