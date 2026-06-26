import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/cart",
        "/checkout",
        "/orders",
        "/wishlist",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/debug-firebase"
      ]
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl
  };
}
