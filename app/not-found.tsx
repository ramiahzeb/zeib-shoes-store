import { LinkButton } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";

export default function NotFoundPage() {
  return (
    <Section>
      <Container className="max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-zeib-soft-gold">404</p>
        <h1 className="mt-3 font-serif text-5xl font-bold">Page not found</h1>
        <p className="mt-4 text-white/65">This ZEIB SHOES page does not exist or may have moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/">Home</LinkButton>
          <LinkButton href="/products" variant="secondary">Shop footwear</LinkButton>
        </div>
      </Container>
    </Section>
  );
}
