"use client";

import { ProductFilters } from "@/components/commerce/product-filters";
import { useProducts } from "@/components/providers/product-provider";

export function StorefrontProducts() {
  const { products, loading, error } = useProducts();

  if (loading) {
    return <p className="text-sm text-white/60">Loading products...</p>;
  }

  return (
    <>
      {error ? (
        <p className="mb-5 rounded-md border border-yellow-300/20 bg-yellow-300/10 p-3 text-sm text-yellow-200">
          Firestore products could not be loaded. Showing demo products.
        </p>
      ) : null}
      <ProductFilters products={products} />
    </>
  );
}
