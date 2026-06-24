"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { demoOrders } from "@/data/demo-products";
import { formatPrice } from "@/lib/format";
import { readAllDemoOrders } from "@/lib/demo-storage";
import type { Order } from "@/lib/types";

export function AdminOrdersList() {
  const [orders] = useState<Order[]>(() => readAllDemoOrders());

  const visibleOrders = orders.length ? orders : demoOrders;

  if (!visibleOrders.length) {
    return (
      <div className="mt-8">
        <EmptyState title="No customer orders yet" body="Orders saved during checkout will appear here for admins." />
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-4">
      {visibleOrders.map((order) => (
        <article key={order.id} className="rounded-md border border-white/10 bg-white/[0.04] p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-lg font-semibold">{order.id}</p>
              <p className="text-sm text-white/55">
                {order.customer.name} | {order.customer.email} | {order.customer.phone} | {order.customer.address}
              </p>
              <p className="mt-2 text-xs text-white/40">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-zeib-soft-gold">{order.status}</p>
              <p className="font-bold">{formatPrice(order.total)}</p>
            </div>
          </div>
          <div className="mt-4 space-y-1 text-sm text-white/65">
            {order.items.map((item) => (
              <p key={`${order.id}-${item.productId}-${item.size}-${item.color}`}>
                {item.productId} | Size {item.size} | {item.color} | Qty {item.quantity}
              </p>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">TODO: Load and update orders/order_items from Firestore with admin-only security rules.</p>
        </article>
      ))}
    </div>
  );
}
