import type { Metadata } from "next";
import { ProductPageContent } from "@/components/commerce/product-page-content";
import { getSeoProductBySlug, getSeoProducts } from "@/lib/firebase/public-products";
import { absoluteUrl, jsonLd, productSeoDescription, targetKeywords } from "@/lib/seo";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getSeoProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getSeoProductBySlug(slug);
  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false }
    };
  }

  const description = productSeoDescription(product);
  const title = `${product.name} | ${product.category} in Pakistan`;
  const url = absoluteUrl(`/products/${product.slug}`);
  const image = absoluteUrl(product.images[0]);

  return {
    title,
    description,
    keywords: [product.name, product.category, ...product.colors, ...targetKeywords],
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title,
      description,
      url,
      siteName: "ZEIB SHOES",
      type: "website",
      locale: "en_PK",
      images: [{ url: image, alt: `${product.name} ${product.category} in Pakistan` }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getSeoProductBySlug(slug);
  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: productSeoDescription(product),
        image: product.images.map((image) => absoluteUrl(image)),
        brand: {
          "@type": "Brand",
          name: "ZEIB SHOES"
        },
        sku: product.id,
        category: product.category,
        color: product.colors.join(", "),
        url: absoluteUrl(`/products/${product.slug}`),
        offers: {
          "@type": "Offer",
          url: absoluteUrl(`/products/${product.slug}`),
          priceCurrency: "PKR",
          price: product.price.toFixed(0),
          availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition"
        }
      }
    : null;

  return (
    <>
      {productSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} /> : null}
      <ProductPageContent slug={slug} />
    </>
  );
}
