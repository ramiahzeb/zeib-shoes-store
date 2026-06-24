"use client";

import { useEffect, useMemo, useState } from "react";
import { Container, Section } from "@/components/ui/section";
import { getFirebaseClientConfig, getFirebaseServices, getAdminEmails } from "@/lib/firebase/client";

type DebugState = {
  status: "idle" | "success" | "error";
  message: string;
};

export default function DebugFirebasePage() {
  const config = useMemo(() => getFirebaseClientConfig(), []);
  const adminEmails = useMemo(() => getAdminEmails(), []);
  const [clientState, setClientState] = useState<DebugState>({
    status: "idle",
    message: "Not checked yet."
  });

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const services = getFirebaseServices();
        if (!services) {
          setClientState({
            status: "error",
            message: "Firebase env vars are missing. Demo auth fallback is active."
          });
          return;
        }
        setClientState({
          status: "success",
          message: `Firebase initialized for project ${services.app.options.projectId || "unknown"}.`
        });
      } catch (caught) {
        setClientState({
          status: "error",
          message: caught instanceof Error ? caught.message : "Firebase client could not initialize."
        });
      }
    });
  }, []);

  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl font-bold">Firebase Debug</h1>
        <div className="mt-6 rounded-md border border-white/10 bg-white/[0.04] p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DebugRow label="Firebase API key loaded" value={config.apiKey ? "yes" : "no"} />
            <DebugRow label="API key prefix" value={config.apiKeyPrefix || "not loaded"} />
            <DebugRow label="Auth domain loaded" value={config.authDomain ? "yes" : "no"} />
            <DebugRow label="Project ID loaded" value={config.projectId ? "yes" : "no"} />
            <DebugRow label="Storage bucket loaded" value={config.storageBucket ? "yes" : "no"} />
            <DebugRow label="App ID loaded" value={config.appId ? "yes" : "no"} />
            <DebugRow label="Admin emails loaded" value={adminEmails.length ? "yes" : "no"} />
            <DebugRow label="Firebase client" value={clientState.status} />
            <DebugRow label="Result" value={clientState.message} wide />
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
