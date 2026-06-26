import type { Metadata } from "next";
import type { Product } from "@/lib/types";

export const siteUrl = "https://www.zeibshoes.my.id";

export const targetKeywords = [
  "comfortable slippers in Pakistan",
  "men slippers Pakistan",
  "anti slip slippers Pakistan",
  "bathroom slippers Pakistan",
  "soft sole slippers Pakistan",
  "ZEIB SHOES slippers",
  "online shoes Pakistan",
  "cash on delivery slippers Pakistan",
  "Rawalpindi shoes online"
];

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  }
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function productSeoDescription(product: Product) {
  const colors = product.colors.length ? ` Available in ${product.colors.join(", ")}.` : "";
  return `Buy ${product.name}, premium ${product.category.toLowerCase()} in Pakistan for PKR ${product.price.toLocaleString("en-PK")}.${colors} ${product.description}`;
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function publicPageMetadata({
  title,
  description,
  path,
  keywords = []
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords: [...keywords, ...targetKeywords],
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: "ZEIB SHOES",
      locale: "en_PK",
      type: "website",
      images: [{ url: absoluteUrl("/images/zeib-hero.png"), alt: "ZEIB SHOES premium footwear in Pakistan" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/images/zeib-hero.png")]
    }
  };
}
