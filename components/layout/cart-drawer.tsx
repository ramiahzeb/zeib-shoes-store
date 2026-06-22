"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { getProductById } from "@/lib/store";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        className={`absolute inset-0 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        aria-label="Close cart"
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-zeib-ink shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-zeib-gold" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
          </div>
          <Button variant="ghost" className="h-10 w-10 p-0" onClick={onClose} aria-label="Close cart">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-white/65">
              <ShoppingBag className="mb-4 h-12 w-12 text-zeib-gold" />
              <p>Your cart is empty.</p>
              <Link href="/products" className="mt-3 text-sm font-semibold text-zeib-soft-gold" onClick={onClose}>
                Browse footwear
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;
                return (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="rounded-md border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="mt-1 text-xs text-white/55">
                          Size {item.size} | {item.color}
                        </p>
                        <p className="mt-2 text-sm text-zeib-soft-gold">{formatPrice(product.price)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        className="h-9 w-9 p-0 text-white/60"
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-white/10">
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          className="h-9 w-9 p-0"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(product.price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-5">
          <div className="mb-4 flex items-center justify-between text-lg font-semibold">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <LinkButton href="/cart" variant="secondary" onClick={onClose} className="w-full">
              View cart
            </LinkButton>
            <LinkButton href="/checkout" onClick={onClose} className="w-full">
              Checkout
            </LinkButton>
          </div>
        </div>
      </aside>
    </div>
  );
}
