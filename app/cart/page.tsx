"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useProducts } from "@/components/providers/product-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Container, Section } from "@/components/ui/section";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const { getProductById } = useProducts();

  return (
    <Section>
      <Container>
        <h1 className="font-serif text-4xl font-bold">Cart</h1>
        {items.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="Your cart is empty" body="Add your favorite ZEIB SHOES products to continue." />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;
                return (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="rounded-md border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                      <div>
                        <Link href={`/products/${product.slug}`} className="text-lg font-semibold hover:text-zeib-soft-gold">
                          {product.name}
                        </Link>
                        <p className="mt-1 text-sm text-white/55">
                          Size {item.size} | {item.color}
                        </p>
                        <p className="mt-2 font-semibold text-zeib-soft-gold">{formatPrice(product.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-md border border-white/10">
                          <Button
                            variant="ghost"
                            className="h-10 w-10 p-0"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-9 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            className="h-10 w-10 p-0"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          className="h-10 w-10 p-0"
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <aside className="h-fit rounded-md border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-semibold">Order summary</h2>
              <div className="mt-5 flex justify-between border-t border-white/10 pt-5">
                <span>Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-3 text-sm text-white/55">Delivery charges are confirmed on WhatsApp.</p>
              <LinkButton href="/checkout" className="mt-5 w-full">
                Continue to checkout
              </LinkButton>
            </aside>
          </div>
        )}
      </Container>
    </Section>
  );
}
