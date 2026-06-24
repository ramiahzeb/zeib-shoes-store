"use client";

import { use } from "react";
import { AdminGuard } from "@/components/commerce/admin-guard";
import { ProductAdminForm } from "@/components/commerce/product-admin-form";
import { useProducts } from "@/components/providers/product-provider";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Container, Section } from "@/components/ui/section";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const { getProductById, loading, error } = useProducts();
  const product = getProductById(id);

  return (
    <Section>
      <Container className="max-w-4xl">
        <AdminGuard>
          <h1 className="font-serif text-4xl font-bold">Edit product</h1>
          <p className="mt-3 text-white/60">Update product data and media references.</p>
          {loading ? <p className="mt-8 text-white/60">Loading product from Firestore...</p> : null}
          {error ? <p className="mt-4 text-sm text-yellow-300">Firestore load failed: {error}</p> : null}
          {!loading && product ? (
            <div className="mt-8">
              <ProductAdminForm key={product.id} product={product} />
            </div>
          ) : null}
          {!loading && !product ? (
            <div className="mt-8">
              <EmptyState title="Product not found" body="This product does not exist in Firestore or demo data." />
              <LinkButton href="/admin/products" className="mt-5">Back to products</LinkButton>
            </div>
          ) : null}
        </AdminGuard>
      </Container>
    </Section>
  );
}
