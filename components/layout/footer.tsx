import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/compare", label: "Compare" },
  { href: "/delivery-returns", label: "Delivery & Returns" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_0.8fr_1fr]">
        <div>
          <p className="font-serif text-2xl font-bold">ZEIB SHOES</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
            Premium footwear for confident everyday movement. Current domain zeibshoes.my.id, future home zeibshoes.com.
          </p>
          <div className="mt-5 flex gap-3 text-zeib-soft-gold">
            <Instagram className="h-5 w-5" />
            <Facebook className="h-5 w-5" />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zeib-soft-gold">Links</h2>
          <div className="mt-4 grid gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-white/65 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zeib-soft-gold">Contact</h2>
          <div className="mt-4 space-y-3 text-sm text-white/65">
            <p className="flex gap-3">
              <Phone className="h-4 w-4 text-zeib-gold" /> +92 300 1234567
            </p>
            <p className="flex gap-3">
              <Mail className="h-4 w-4 text-zeib-gold" /> hello@zeibshoes.my.id
            </p>
            <p className="flex gap-3">
              <MapPin className="h-4 w-4 text-zeib-gold" /> Delivery across Pakistan
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
