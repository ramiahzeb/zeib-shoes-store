"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";

export default function ForgotPasswordPage() {
  const { authMode, requestPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  return (
    <Section>
      <Container className="max-w-lg">
        <h1 className="font-serif text-4xl font-bold">Forgot password</h1>
        <form
          className="mt-6 rounded-md border border-white/10 bg-white/[0.04] p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            try {
              await requestPasswordReset(email);
              setSent(true);
            } catch (caught) {
              setSent(false);
              setError(caught instanceof Error ? caught.message : "Could not start password reset.");
            }
          }}
        >
          <label>
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
              required
            />
          </label>
          <Button type="submit" className="mt-5 w-full">Send reset email</Button>
          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
          {sent ? (
            <p className="mt-4 text-sm text-green-300">
              {authMode === "firebase" ? (
                "If an account exists with this email, a reset link has been sent."
              ) : (
                <>
                  Demo reset started. <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="font-semibold underline">Set a new password</Link>.
                </>
              )}
            </p>
          ) : null}
        </form>
      </Container>
    </Section>
  );
}
