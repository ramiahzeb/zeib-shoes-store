import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://zeibshoes.my.id"),
  title: {
    default: "ZEIB SHOES | Walk With Confidence",
    template: "%s | ZEIB SHOES"
  },
  description:
    "Premium footwear for confident everyday style. Shop slippers, slides, sandals, and shoes from ZEIB SHOES.",
  keywords: ["ZEIB SHOES", "footwear Pakistan", "slippers", "slides", "sandals", "shoes"],
  openGraph: {
    title: "ZEIB SHOES",
    description: "Walk With Confidence",
    url: "https://zeibshoes.my.id",
    siteName: "ZEIB SHOES",
    images: ["/images/zeib-hero.png"],
    locale: "en_PK",
    type: "website"
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
