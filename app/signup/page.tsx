"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <Section>
      <Container className="max-w-lg">
        <h1 className="font-serif text-4xl font-bold">Create account</h1>
        <form
          className="mt-6 rounded-md border border-white/10 bg-white/[0.04] p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError("");
            const form = new FormData(event.currentTarget);
            try {
              await signup({
                name: String(form.get("name")),
                email: String(form.get("email")),
                phone: String(form.get("phone")),
                password: String(form.get("password"))
              });
              router.push("/account");
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Could not create account.");
            } finally {
              setLoading(false);
            }
          }}
        >
          {["name", "email", "phone", "password"].map((field) => (
            <label key={field} className="mt-4 block first:mt-0">
              <span className="text-sm font-medium capitalize">{field}</span>
              <input
                name={field}
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                minLength={field === "password" ? 6 : undefined}
                className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
                required
              />
            </label>
          ))}
          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
          <Button type="submit" className="mt-5 w-full" disabled={loading}>
            {loading ? "Creating..." : "Sign up"}
          </Button>
          <p className="mt-4 text-sm text-white/60">
            Already have an account? <Link href="/login" className="text-zeib-soft-gold">Login</Link>
          </p>
        </form>
      </Container>
    </Section>
  );
}
