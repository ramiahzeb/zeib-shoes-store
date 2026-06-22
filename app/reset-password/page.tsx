"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordShell />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordShell() {
  return (
    <Section>
      <Container className="max-w-lg">
        <h1 className="font-serif text-4xl font-bold">Reset password</h1>
      </Container>
    </Section>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");

  return (
    <Section>
      <Container className="max-w-lg">
        <h1 className="font-serif text-4xl font-bold">Reset password</h1>
        <form
          className="mt-6 rounded-md border border-white/10 bg-white/[0.04] p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            try {
              await resetPassword(email, password);
              setDone(true);
            } catch (caught) {
              setDone(false);
              setError(caught instanceof Error ? caught.message : "Could not reset password.");
            }
          }}
        >
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
              required
            />
          </label>
          <label>
            <span className="text-sm font-medium">New password</span>
            <input
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
              required
            />
          </label>
          <Button type="submit" className="mt-5 w-full">Reset password</Button>
          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
          {done ? (
            <p className="mt-4 text-sm text-green-300">
              Password reset saved in demo mode. <Link href={`/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`} className="font-semibold underline">Login now</Link>.
            </p>
          ) : null}
        </form>
      </Container>
    </Section>
  );
}
