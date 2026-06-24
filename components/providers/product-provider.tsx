"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products as demoProducts } from "@/data/demo-products";
import { readFirebaseProducts } from "@/lib/firebase/products";
import type { Product } from "@/lib/types";

type ProductSource = "firebase" | "demo";

type ProductContextValue = {
  products: Product[];
  loading: boolean;
  error: string;
  source: ProductSource;
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
};

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState<ProductSource>("demo");

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const firebaseProducts = await readFirebaseProducts();
      if (firebaseProducts.length) {
        setProducts(firebaseProducts);
        setSource("firebase");
      } else {
        setProducts(demoProducts);
        setSource("demo");
      }
    } catch (caught) {
      setProducts(demoProducts);
      setSource("demo");
      setError(caught instanceof Error ? caught.message : "Could not load products from Firestore.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshProducts();
    });
  }, [refreshProducts]);

  const value = useMemo<ProductContextValue>(
    () => ({
      products,
      loading,
      error,
      source,
      refreshProducts,
      getProductById: (id) => products.find((product) => product.id === id),
      getProductBySlug: (slug) => products.find((product) => product.slug === slug)
    }),
    [error, loading, products, refreshProducts, source]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used inside ProductProvider");
  return context;
}
