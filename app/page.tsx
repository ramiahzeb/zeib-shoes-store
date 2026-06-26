import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FeaturedProducts } from "@/components/commerce/featured-products";
import { TrustBadges } from "@/components/commerce/trust-badges";
import { LinkButton } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { absoluteUrl, jsonLd } from "@/lib/seo";

export default function HomePage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ZEIB SHOES",
    url: absoluteUrl(),
    logo: absoluteUrl("/images/zeib-hero.png"),
    slogan: "Walk With Confidence",
    description: "ZEIB SHOES offers comfortable slippers, slides, sandals, and shoes in Pakistan.",
    areaServed: {
      "@type": "Country",
      name: "Pakistan"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }} />
      <section className="relative min-h-[78vh] overflow-hidden">
        <Image src="/images/zeib-hero.png" alt="ZEIB SHOES comfortable slippers and shoes collection in Pakistan" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/10" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zeib-soft-gold">Walk With Confidence</p>
          <h1 className="mt-5 max-w-2xl font-serif text-5xl font-bold leading-tight sm:text-7xl">ZEIB SHOES</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">
            Premium black, gold, and white footwear for daily comfort, sharp occasions, and confident movement across Pakistan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/products">
              Shop collection <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="/size-guide" variant="secondary">
              Find your size
            </LinkButton>
          </div>
        </div>
      </section>

      <Section className="bg-zeib-black">
        <Container>
          <TrustBadges />
        </Container>
      </Section>

      <Section className="bg-white text-black">
        <Container>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-zeib-gold">Featured</p>
              <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">Premium picks</h2>
            </div>
            <LinkButton href="/products" variant="secondary" className="border-black/20 text-black hover:bg-black/5">
              View all
            </LinkButton>
          </div>
          <FeaturedProducts />
        </Container>
      </Section>

      <Section className="bg-zeib-ink">
        <Container className="grid gap-8 lg:grid-cols-3">
          {[
            "Firebase-ready auth, database, reviews, wishlist, and orders.",
            "WhatsApp checkout sends complete cart and customer details.",
            "Vercel-ready architecture with server-only email API route."
          ].map((item) => (
            <div key={item} className="flex gap-3 rounded-md border border-white/10 bg-white/[0.04] p-5">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-zeib-gold" />
              <p className="text-sm leading-6 text-white/70">{item}</p>
            </div>
          ))}
        </Container>
      </Section>
    </>
  );
}
