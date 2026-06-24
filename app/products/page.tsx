import type { Metadata } from "next";
import { StorefrontProducts } from "@/components/commerce/storefront-products";
import { Container, Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Shop Footwear",
  description: "Browse ZEIB SHOES slippers, slides, sandals, and shoes."
};

export default function ProductsPage() {
  return (
    <Section>
      <Container>
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-zeib-soft-gold">Shop</p>
          <h1 className="mt-2 font-serif text-4xl font-bold">All Footwear</h1>
          <p className="mt-3 max-w-2xl text-white/65">
            Search, filter by category and price, then sort by price, rating, or newest arrivals.
          </p>
        </div>
        <StorefrontProducts />
      </Container>
    </Section>
  );
}
