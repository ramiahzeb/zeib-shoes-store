"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useProducts } from "@/components/providers/product-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Container, Section } from "@/components/ui/section";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const { customer } = useAuth();
  const { items, subtotal, buildWhatsAppUrl, saveOrder } = useCart();
  const { getProductById } = useProducts();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    address: customer?.address ?? ""
  });
  const complete = form.name && form.email && form.phone && form.address;

  return (
    <Section>
      <Container>
        <h1 className="font-serif text-4xl font-bold">Checkout</h1>
        {items.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="Nothing to checkout" body="Your cart is empty." />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
            <form className="rounded-md border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-semibold">Customer details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  ["name", "Name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["address", "Address"]
                ].map(([key, label]) => (
                  <label key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                    <span className="text-sm font-medium text-white/75">{label}</span>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                      className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
                      required
                    />
                  </label>
                ))}
              </div>
              <p className="mt-4 text-sm text-white/55">
                Your order will open in WhatsApp with full cart details for confirmation.
              </p>
            </form>

            <aside className="h-fit rounded-md border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-semibold">WhatsApp summary</h2>
              <div className="mt-5 space-y-3">
                {items.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;
                  return (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between gap-3 text-sm">
                      <span>
                        {product.name} x {item.quantity}
                      </span>
                      <span>{formatPrice(product.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 flex justify-between border-t border-white/10 pt-5 font-bold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Button
                className="mt-5 w-full"
                disabled={!complete || submitting}
                onClick={async () => {
                  setSubmitting(true);
                  setError("");
                  setStatus("");
                  try {
                    await saveOrder(form);
                    setStatus("Order saved. Opening WhatsApp...");
                    window.location.href = buildWhatsAppUrl(form);
                  } catch (caught) {
                    setError(caught instanceof Error ? caught.message : "Could not save order.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <MessageCircle className="h-4 w-4" /> {submitting ? "Saving..." : "Order on WhatsApp"}
              </Button>
              {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
              {status ? <p className="mt-3 text-sm text-green-300">{status}</p> : null}
              {!customer ? (
                <LinkButton href="/login" variant="secondary" className="mt-3 w-full">
                  Login before checkout
                </LinkButton>
              ) : null}
            </aside>
          </div>
        )}
      </Container>
    </Section>
  );
}
