"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { createSupabaseBrowserClient, getSupabaseBrowserConfig } from "@/lib/supabase/client";

type ConnectionState = {
  status: "idle" | "testing" | "success" | "error";
  message: string;
};

type SignupState = ConnectionState & {
  userId?: string;
  email?: string;
  sessionReturned?: string;
  confirmationLikelyRequired?: string;
};

function describeDebugError(caught: unknown) {
  const error = caught as {
    message?: string;
    name?: string;
    status?: number;
    code?: string;
  };
  const details = [
    error?.status ? `status ${error.status}` : "",
    error?.code ? `code ${error.code}` : "",
    error?.name && error.name !== "Error" ? `name ${error.name}` : ""
  ].filter(Boolean);
  const message = error?.message || String(caught);
  if (message === "Failed to fetch") {
    return `Failed to fetch. The browser could not complete the request before Supabase returned a response.${details.length ? ` (${details.join(", ")})` : ""}`;
  }
  return `${message}${details.length ? ` (${details.join(", ")})` : ""}`;
}

function createDebugEmail() {
  return `zeib-debug-${Date.now()}@example.com`;
}

export default function DebugSupabasePage() {
  const config = useMemo(() => getSupabaseBrowserConfig(), []);
  const [connection, setConnection] = useState<ConnectionState>({
    status: "idle",
    message: "Not tested yet."
  });
  const [serverConnection, setServerConnection] = useState<ConnectionState>({
    status: "idle",
    message: "Not tested yet."
  });
  const [signupEmail, setSignupEmail] = useState("zeib-debug@example.com");
  const [signupState, setSignupState] = useState<SignupState>({
    status: "idle",
    message: "Not tested yet."
  });

  useEffect(() => {
    if (!config.hasUrl || !config.hasKey) {
      queueMicrotask(() => {
        setConnection({
          status: "error",
          message: `Skipped connection test. Missing: ${config.missing.join(", ") || "unknown config"}.`
        });
      });
      return;
    }

    const controller = new AbortController();
    queueMicrotask(() => {
      setConnection({ status: "testing", message: "Testing Supabase Auth health endpoint..." });
    });

    fetch(`${config.supabaseUrl.replace(/\/+$/, "")}/auth/v1/health`, {
      method: "GET",
      cache: "no-store",
      headers: {
        apikey: config.supabaseKey,
        Authorization: `Bearer ${config.supabaseKey}`
      },
      signal: controller.signal
    })
      .then(async (response) => {
        const body = (await response.text()).trim();
        setConnection({
          status: response.ok ? "success" : "error",
          message: `${response.status} ${response.statusText}${body ? ` - ${body.slice(0, 180)}` : ""}`
        });
      })
      .catch((caught) => {
        if (controller.signal.aborted) return;
        setConnection({
          status: "error",
          message:
            caught instanceof Error && caught.message === "Failed to fetch"
              ? "Browser fetch failed before Supabase returned a response. This usually means CORS, browser/network blocking, or an unreachable URL from the browser."
              : describeDebugError(caught)
        });
      });

    return () => controller.abort();
  }, [config]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      setServerConnection({ status: "testing", message: "Testing from Next.js server route..." });
    });

    fetch("/api/debug-supabase", {
      cache: "no-store",
      signal: controller.signal
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          health?: { status?: ConnectionState["status"]; message?: string };
        };
        setServerConnection({
          status: data.health?.status ?? (response.ok ? "success" : "error"),
          message: data.health?.message || `${response.status} ${response.statusText}`
        });
      })
      .catch((caught) => {
        if (controller.signal.aborted) return;
        setServerConnection({
          status: "error",
          message: describeDebugError(caught)
        });
      });

    return () => controller.abort();
  }, []);

  async function runSignupTest() {
    const normalizedEmail = signupEmail.trim().toLowerCase();
    if (!config.hasUrl || !config.hasKey) {
      setSignupState({
        status: "error",
        message: `Cannot test signup. Missing: ${config.missing.join(", ") || "Supabase config"}.`
      });
      return;
    }
    if (!normalizedEmail) {
      setSignupState({ status: "error", message: "Enter a test email first." });
      return;
    }

    setSignupState({ status: "testing", message: "Running Supabase JS signUp test..." });
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase client was not created.");

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: "ZeibDebug123!",
        options: {
          data: {
            name: "ZEIB Debug User",
            phone: "+920000000000"
          },
          emailRedirectTo: `${window.location.origin}/account`
        }
      });

      if (error) {
        setSignupState({
          status: "error",
          message: describeDebugError(error),
          email: normalizedEmail
        });
        return;
      }

      setSignupState({
        status: "success",
        message: data.user ? "Supabase JS signUp returned a user." : "Signup completed, but no user object was returned.",
        email: normalizedEmail,
        userId: data.user?.id,
        sessionReturned: data.session ? "yes" : "no",
        confirmationLikelyRequired: data.session ? "no" : "yes"
      });
    } catch (caught) {
      setSignupState({
        status: "error",
        message:
          caught instanceof Error && caught.message === "Failed to fetch"
            ? "Failed to fetch. Browser could not complete Supabase signUp; compare browser health with server health above, then check CORS/network blocking and Supabase Auth URL settings."
            : describeDebugError(caught),
        email: normalizedEmail
      });
    }
  }

  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl font-bold">Supabase Debug</h1>
        <div className="mt-6 rounded-md border border-white/10 bg-white/[0.04] p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DebugRow label="Supabase URL loaded" value={config.hasUrl ? "yes" : "no"} />
            <DebugRow label="Supabase key loaded" value={config.hasKey ? "yes" : "no"} />
            <DebugRow label="Supabase URL origin" value={config.urlOrigin || "not loaded"} />
            <DebugRow label="URL normalized" value={config.urlWasNormalized ? "yes" : "no"} />
            <DebugRow label="Key source" value={config.keySource} />
            <DebugRow label="Key prefix" value={config.keyPrefix || "not loaded"} />
            <DebugRow label="Browser health fetch" value={connection.status} />
            <DebugRow label="Browser health result" value={connection.message} wide />
            <DebugRow label="Server health fetch" value={serverConnection.status} />
            <DebugRow label="Server health result" value={serverConnection.message} wide />
          </dl>
        </div>

        <div className="mt-6 rounded-md border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-semibold">SignUp Test</h2>
          <label className="mt-4 block">
            <span className="text-sm font-medium">Test email</span>
            <input
              type="email"
              value={signupEmail}
              onChange={(event) => setSignupEmail(event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-md border border-white/10 bg-black/50 px-3"
            />
          </label>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={runSignupTest} disabled={signupState.status === "testing"}>
              {signupState.status === "testing" ? "Testing..." : "Run signUp test"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setSignupEmail(createDebugEmail())}>
              New test email
            </Button>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <DebugRow label="signUp test" value={signupState.status} />
            <DebugRow label="Test email" value={signupState.email || signupEmail} />
            <DebugRow label="Result/error details" value={signupState.message} wide />
            {signupState.userId ? <DebugRow label="Returned user id" value={signupState.userId} /> : null}
            {signupState.sessionReturned ? <DebugRow label="Session returned" value={signupState.sessionReturned} /> : null}
            {signupState.confirmationLikelyRequired ? (
              <DebugRow label="Email confirmation likely required" value={signupState.confirmationLikelyRequired} />
            ) : null}
          </dl>
        </div>
      </Container>
    </Section>
  );
}

function DebugRow({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-sm text-white/55">{label}</dt>
      <dd className="mt-1 break-words rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white">
        {value}
      </dd>
    </div>
  );
}
