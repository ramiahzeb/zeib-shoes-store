import type { MetadataRoute } from "next";
import { getSeoProducts } from "@/lib/firebase/public-products";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/products"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/size-guide"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/delivery-returns"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/reviews"), changeFrequency: "weekly", priority: 0.6 }
  ];
  const products = await getSeoProducts();

  return [
    ...publicPages,
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt || product.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
