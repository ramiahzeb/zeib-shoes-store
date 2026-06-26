import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { absoluteUrl, targetKeywords } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zeibshoes.my.id"),
  title: {
    default: "ZEIB SHOES | Comfortable Slippers & Shoes in Pakistan",
    template: "%s | ZEIB SHOES"
  },
  description:
    "Shop comfortable slippers, slides, sandals, and shoes in Pakistan from ZEIB SHOES. Cash on Delivery and easy exchange available.",
  keywords: targetKeywords,
  alternates: { canonical: "/" },
  openGraph: {
    title: "ZEIB SHOES | Comfortable Slippers & Shoes in Pakistan",
    description: "Walk With Confidence. Shop comfortable footwear with Cash on Delivery across Pakistan.",
    url: "https://www.zeibshoes.my.id",
    siteName: "ZEIB SHOES",
    images: [{ url: absoluteUrl("/images/zeib-hero.png"), alt: "ZEIB SHOES comfortable footwear in Pakistan" }],
    locale: "en_PK",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ZEIB SHOES | Walk With Confidence",
    description: "Comfortable slippers and shoes in Pakistan.",
    images: [absoluteUrl("/images/zeib-hero.png")]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zeib-black font-sans antialiased">
        <AppProviders>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
