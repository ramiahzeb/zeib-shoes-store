"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginFormFromParams />
    </Suspense>
  );
}

function LoginShell() {
  return (
    <Section>
      <Container className="max-w-lg">
        <h1 className="font-serif text-4xl font-bold">Login</h1>
      </Container>
    </Section>
  );
}

function LoginFormFromParams() {
  const searchParams = useSearchParams();
  return (
    <LoginForm
      key={searchParams.toString()}
      initialEmail={searchParams.get("email") ?? ""}
      initialPassword={searchParams.get("password") ?? ""}
    />
  );
}

function LoginForm({
  initialEmail,
  initialPassword
}: {
  initialEmail: string;
  initialPassword: string;
}) {
  const router = useRouter();
  const { authMode, login } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);

  return (
    <Section>
      <Container className="max-w-lg">
        <h1 className="font-serif text-4xl font-bold">Login</h1>
        <form
          className="mt-6 rounded-md border border-white/10 bg-white/[0.04] p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError("");
            setSuccess("");
            const form = new FormData(event.currentTarget);
            try {
              const nextCustomer = await login(String(form.get("email")), String(form.get("password")));
              const destination = nextCustomer.role === "admin" ? "/admin" : "/account";
              setSuccess(`Logged in successfully. Redirecting to ${destination}...`);
              window.setTimeout(() => router.push(destination), 150);
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "Could not login.");
              setLoading(false);
            }
          }}
        >
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
              required
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium">Password</span>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
              required
            />
          </label>
          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
          {success ? <p className="mt-3 text-sm text-green-300">{success}</p> : null}
          <Button type="submit" className="mt-5 w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
          <div className="mt-4 flex justify-between text-sm text-white/60">
            <Link href="/signup" className="hover:text-white">Create account</Link>
            <Link href="/forgot-password" className="hover:text-white">Forgot password?</Link>
          </div>
          <div className="mt-4 space-y-1 text-xs text-white/45">
            {authMode === "demo" ? (
              <>
                <p>Admin demo: admin@zeibshoes.my.id with any non-empty password.</p>
                <p>User demo: user@zeibshoes.my.id / 123456</p>
              </>
            ) : (
              <p>Firebase authentication is enabled. Use a Firebase account for login.</p>
            )}
          </div>
        </form>
      </Container>
    </Section>
  );
}
