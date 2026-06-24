"use client";

import { ProductCard } from "@/components/commerce/product-card";
import { useCart } from "@/components/providers/cart-provider";
import { useProducts } from "@/components/providers/product-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Container, Section } from "@/components/ui/section";

export default function WishlistPage() {
  const { wishlist } = useCart();
  const { products } = useProducts();
  const savedProducts = products.filter((product) => wishlist.includes(product.id));

  return (
    <Section>
      <Container>
        <h1 className="font-serif text-4xl font-bold">Wishlist</h1>
        {savedProducts.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState title="No wishlist items" body="Tap the heart on products you want to save." />
          </div>
        )}
      </Container>
    </Section>
  );
}
