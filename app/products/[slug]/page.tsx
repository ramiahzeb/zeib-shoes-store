import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductDetail } from "@/components/commerce/product-detail";
import { Container, Section } from "@/components/ui/section";
import { getApprovedReviews, getProductBySlug, getProducts, getRelatedProducts } from "@/lib/store";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const related = getRelatedProducts(product);

  return (
    <>
      <Section>
        <Container>
          <ProductDetail product={product} reviews={getApprovedReviews(product.id)} />
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
