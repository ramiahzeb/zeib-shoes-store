"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <Section>
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-zeib-soft-gold">Contact</p>
            <h1 className="mt-2 font-serif text-4xl font-bold">Talk to ZEIB SHOES</h1>
            <div className="mt-8 space-y-4 text-white/68">
              <p className="flex gap-3"><Phone className="h-5 w-5 text-zeib-gold" /> +92 300 1234567</p>
              <p className="flex gap-3"><Mail className="h-5 w-5 text-zeib-gold" /> hello@zeibshoes.my.id</p>
              <p className="flex gap-3"><MapPin className="h-5 w-5 text-zeib-gold" /> Pakistan</p>
              <p className="flex gap-3"><MessageCircle className="h-5 w-5 text-zeib-gold" /> WhatsApp order support</p>
            </div>
          </div>
          <form
            className="rounded-md border border-white/10 bg-white/[0.04] p-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-medium">Name</span>
                <input className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3" required />
              </label>
              <label>
                <span className="text-sm font-medium">Email</span>
                <input type="email" className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3" required />
              </label>
              <label className="sm:col-span-2">
                <span className="text-sm font-medium">Message</span>
                <textarea className="focus-ring mt-2 min-h-36 w-full rounded-md border border-white/10 bg-black/50 p-3" required />
              </label>
            </div>
            <Button className="mt-5">Send message</Button>
            {sent ? <p className="mt-3 text-sm text-green-300">Message saved in demo mode.</p> : null}
          </form>
        </div>
      </Container>
    </Section>
  );
}
