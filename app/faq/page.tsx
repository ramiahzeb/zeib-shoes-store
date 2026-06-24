import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about ZEIB SHOES orders, delivery, exchange, and sizing."
};

const faqs = [
  ["Do you offer Cash on Delivery?", "Yes, Cash on Delivery is available for orders across Pakistan."],
  ["How do I confirm my order?", "Checkout opens WhatsApp with your complete order summary so our team can confirm availability and delivery."],
  ["Can I exchange size?", "Yes, easy exchange is available for eligible unworn products with original packaging."],
  ["When will Firebase be connected?", "Add Firebase web app keys, enable email/password auth, and publish Firestore security rules for live data."]
];

export default function FAQPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl font-bold">FAQ</h1>
        <div className="mt-8 space-y-4">
          {faqs.map(([question, answer]) => (
            <article key={question} className="rounded-md border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-semibold">{question}</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">{answer}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
