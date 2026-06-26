import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Contact ZEIB SHOES",
  description: "Contact ZEIB SHOES for online shoe orders, slipper sizing, delivery support, and Rawalpindi footwear inquiries.",
  path: "/contact",
  keywords: ["Rawalpindi shoes online", "ZEIB SHOES slippers"]
});

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
