"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useProducts } from "@/components/providers/product-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Container, Section } from "@/components/ui/section";
import { formatPrice } from "@/lib/format";

export default function OrdersPage() {
  const router = useRouter();
  const { customer, loading } = useAuth();
  const { orders } = useCart();
  const { getProductById } = useProducts();

  useEffect(() => {
    if (!loading && !customer) router.push("/login");
  }, [customer, loading, router]);

  if (!customer) return null;

  return (
    <Section>
      <Container>
        <h1 className="font-serif text-4xl font-bold">Orders</h1>
        {orders.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No orders yet" body="Your order history will appear here." />
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-md border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="text-lg font-semibold">{order.id}</p>
                    <p className="text-sm text-white/55">{order.createdAt}</p>
                  </div>
                  <p className="text-zeib-soft-gold">{order.status}</p>
                </div>
                <div className="mt-4 space-y-2">
                  {order.items.map((item) => {
                    const product = getProductById(item.productId);
                    return (
                      <p key={`${item.productId}-${item.size}`} className="text-sm text-white/65">
                        {product?.name} | Size {item.size} | Qty {item.quantity}
                      </p>
                    );
                  })}
                </div>
                <p className="mt-4 font-bold">{formatPrice(order.total)}</p>
              </article>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
