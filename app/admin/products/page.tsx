"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminGuard } from "@/components/commerce/admin-guard";
import { useProducts } from "@/components/providers/product-provider";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Container, Section } from "@/components/ui/section";
import { deleteFirebaseProduct } from "@/lib/firebase/products";
import { formatPrice } from "@/lib/format";

export default function ManageProductsPage() {
  const { products, loading, error, source, refreshProducts } = useProducts();
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function removeProduct(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;

    setDeletingId(id);
    setActionError("");
    try {
      await deleteFirebaseProduct(id);
      await refreshProducts();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Could not delete the product.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <Section>
      <Container>
        <AdminGuard>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="font-serif text-4xl font-bold">Manage products</h1>
            <LinkButton href="/admin/products/add">
              <Plus className="h-4 w-4" /> Add product
            </LinkButton>
          </div>
          {loading ? <p className="mt-6 text-sm text-white/60">Loading products from Firestore...</p> : null}
          {!loading && source === "demo" ? (
            <p className="mt-6 rounded-md border border-zeib-gold/30 bg-zeib-gold/10 p-3 text-sm text-zeib-soft-gold">
              Firestore has no products, so demo products are shown. Saving a demo product will add it to Firestore.
            </p>
          ) : null}
          {error ? <p className="mt-4 text-sm text-yellow-300">Firestore load failed: {error}</p> : null}
          {actionError ? <p className="mt-4 text-sm text-red-300">{actionError}</p> : null}
          <div className="mt-8 overflow-hidden rounded-md border border-white/10">
            {!loading && products.length === 0 ? (
              <EmptyState title="No products" body="Add the first ZEIB SHOES product to Firestore." />
            ) : (
              products.map((product) => (
                <div key={product.id} className="grid gap-4 border-b border-white/10 bg-white/[0.04] p-4 last:border-0 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-white/55">
                      {product.category} | {formatPrice(product.price)} | Stock {product.stock}
                    </p>
                  </div>
                  <Link href={`/admin/products/edit/${product.id}`} className="inline-flex items-center gap-2 text-sm text-zeib-soft-gold">
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                  <button
                    className="inline-flex items-center gap-2 text-sm text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={source === "demo" || deletingId === product.id}
                    onClick={() => void removeProduct(product.id, product.name)}
                  >
                    <Trash2 className="h-4 w-4" /> {deletingId === product.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ))
            )}
          </div>
        </AdminGuard>
      </Container>
    </Section>
  );
}
