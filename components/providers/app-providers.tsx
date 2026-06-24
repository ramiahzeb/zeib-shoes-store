"use client";

import { CartProvider } from "@/components/providers/cart-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ProductProvider } from "@/components/providers/product-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>{children}</CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
