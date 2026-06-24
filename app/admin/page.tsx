"use client";

import { Package, ShoppingCart, Star, Users } from "lucide-react";
import { AdminGuard } from "@/components/commerce/admin-guard";
import { useProducts } from "@/components/providers/product-provider";
import { LinkButton } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { demoOrders, reviews } from "@/data/demo-products";

export default function AdminDashboardPage() {
  const { products } = useProducts();
  const stats = [
    { label: "Products", value: products.length, icon: Package },
    { label: "Orders", value: demoOrders.length, icon: ShoppingCart },
    { label: "Reviews", value: reviews.length, icon: Star },
    { label: "Customers", value: 1, icon: Users }
  ];

  return (
    <Section>
      <Container>
        <AdminGuard>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-zeib-soft-gold">Admin</p>
              <h1 className="mt-2 font-serif text-4xl font-bold">Dashboard</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/admin/products/add">Add product</LinkButton>
              <LinkButton href="/admin/products" variant="secondary">Manage products</LinkButton>
              <LinkButton href="/admin/orders" variant="secondary">Manage orders</LinkButton>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-white/10 bg-white/[0.04] p-5">
                <stat.icon className="h-6 w-6 text-zeib-gold" />
                <p className="mt-5 text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/55">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-semibold">Review moderation</h2>
              <div className="mt-4 space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-md border border-white/10 p-3">
                    <div className="flex justify-between gap-3">
                      <p className="font-medium">{review.customerName}</p>
                      <span className={review.approved ? "text-green-300" : "text-yellow-300"}>
                        {review.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/60">{review.comment}</p>
                    <p className="mt-2 text-xs text-white/40">TODO: Add approve/delete server actions with Firebase security rules.</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-semibold">Customers</h2>
              <div className="mt-4 rounded-md border border-white/10 p-3">
                <p className="font-medium">Demo Customer</p>
                <p className="text-sm text-white/60">customer@example.com | +92 300 1234567</p>
                <p className="mt-2 text-xs text-white/40">TODO: Load customers from Firestore customers collection.</p>
              </div>
            </div>
          </div>
        </AdminGuard>
      </Container>
    </Section>
  );
}
