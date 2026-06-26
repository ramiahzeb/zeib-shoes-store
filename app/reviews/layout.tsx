import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "ZEIB SHOES Customer Reviews",
  description: "Read customer reviews for ZEIB SHOES slippers, slides, sandals, and comfortable footwear in Pakistan.",
  path: "/reviews",
  keywords: ["ZEIB SHOES slippers", "comfortable slippers in Pakistan"]
});

export default function ReviewsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
