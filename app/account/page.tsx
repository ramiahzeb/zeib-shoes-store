"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import type { Customer } from "@/lib/types";

export default function AccountPage() {
  const router = useRouter();
  const { customer, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !customer) router.push("/login");
  }, [customer, loading, router]);

  if (!customer) return null;

  return (
    <Section>
      <Container className="max-w-4xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-serif text-4xl font-bold">My Account</h1>
            <p className="mt-2 text-white/65">Welcome to ZEIB SHOES Store, {customer.name}!</p>
          </div>
          <Button variant="secondary" onClick={logout}>Logout</Button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <LinkButton href="/orders" variant="secondary">Orders</LinkButton>
          <LinkButton href="/wishlist" variant="secondary">Wishlist</LinkButton>
          <LinkButton href="/reviews" variant="secondary">Reviews</LinkButton>
        </div>

        <AccountDetailsForm key={customer.id} customer={customer} />
      </Container>
    </Section>
  );
}

function AccountDetailsForm({ customer }: { customer: Customer }) {
  const { updateCustomer } = useAuth();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address
  });

  return (
    <form
      className="mt-8 rounded-md border border-white/10 bg-white/[0.04] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        updateCustomer({ ...customer, ...form });
        setSaved(true);
      }}
    >
      <h2 className="text-xl font-semibold">Customer details</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[
          ["name", "Name"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["address", "Address"]
        ].map(([key, label]) => (
          <label key={key} className={key === "address" ? "sm:col-span-2" : ""}>
            <span className="text-sm font-medium">{label}</span>
            <input
              value={form[key as keyof typeof form]}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
              required
            />
          </label>
        ))}
      </div>
      <Button className="mt-5">Save details</Button>
      {saved ? <p className="mt-3 text-sm text-green-300">Customer details saved locally.</p> : null}
    </form>
  );
}
