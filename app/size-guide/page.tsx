import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/section";
import { publicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = publicPageMetadata({
  title: "Slipper & Shoe Size Guide Pakistan",
  description: "Find your ZEIB SHOES slipper, slide, sandal, or shoe size with our Pakistan size guide and fitting advice.",
  path: "/size-guide",
  keywords: ["men slippers Pakistan", "comfortable slippers in Pakistan"]
});

const rows = [
  ["PK/EU 38", "24.0 cm"],
  ["PK/EU 39", "24.5 cm"],
  ["PK/EU 40", "25.0 cm"],
  ["PK/EU 41", "26.0 cm"],
  ["PK/EU 42", "26.5 cm"],
  ["PK/EU 43", "27.5 cm"],
  ["PK/EU 44", "28.0 cm"],
  ["PK/EU 45", "29.0 cm"]
];

export default function SizeGuidePage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl font-bold">Size Guide</h1>
        <p className="mt-3 text-white/65">Measure heel to toe and choose the closest size. For wide feet, consider one size up.</p>
        <div className="mt-8 overflow-hidden rounded-md border border-white/10">
          {rows.map(([size, length]) => (
            <div key={size} className="grid grid-cols-2 border-b border-white/10 bg-white/[0.04] p-4 last:border-0">
              <span className="font-semibold">{size}</span>
              <span className="text-white/65">{length}</span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
