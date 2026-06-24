"use client";

import { ProductCard } from "@/components/commerce/product-card";
import { ProductDetail } from "@/components/commerce/product-detail";
import { useProducts } from "@/components/providers/product-provider";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Container, Section } from "@/components/ui/section";
import { getApprovedReviews } from "@/lib/store";

export function ProductPageContent({ slug }: { slug: string }) {
  const { products, getProductBySlug, loading, error } = useProducts();
  const product = getProductBySlug(slug);

  if (loading) {
    return (
      <Section>
        <Container>
          <p className="text-white/60">Loading product...</p>
        </Container>
      </Section>
    );
  }

  if (!product) {
    return (
      <Section>
        <Container>
          <EmptyState title="Product not found" body="This product is no longer available." />
          <LinkButton href="/products" className="mt-5">Back to shop</LinkButton>
        </Container>
      </Section>
    );
  }

  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  return (
    <>
      <Section>
        <Container>
          {error ? (
            <p className="mb-5 text-sm text-yellow-300">Firestore is unavailable. This product is loaded from demo data.</p>
          ) : null}
          <ProductDetail key={product.id} product={product} reviews={getApprovedReviews(product.id)} />
        </Container>
      </Section>
      {related.length ? (
        <Section className="bg-white text-black">
          <Container>
            <h2 className="font-serif text-3xl font-bold">Related products</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3 [&_article]:border-black/10 [&_article]:bg-black/[0.03] [&_article_a]:text-black [&_article_p]:text-black/65 [&_button]:text-black">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
