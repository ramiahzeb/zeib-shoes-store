import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Delivery & Returns",
  description: "ZEIB SHOES delivery, exchange, and return policy."
};

export default function DeliveryReturnsPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl font-bold">Delivery & Return Policy</h1>
        <div className="mt-8 space-y-5 text-white/68">
          <section className="rounded-md border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold text-white">Delivery</h2>
            <p className="mt-2 leading-7">We deliver across Pakistan. Delivery timing and charges are confirmed during WhatsApp checkout.</p>
          </section>
          <section className="rounded-md border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold text-white">Exchange</h2>
            <p className="mt-2 leading-7">Size exchanges are available for unworn products in original condition and packaging.</p>
          </section>
          <section className="rounded-md border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold text-white">Returns</h2>
            <p className="mt-2 leading-7">Return eligibility depends on product condition and order confirmation details shared by ZEIB SHOES support.</p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
