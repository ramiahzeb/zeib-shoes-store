"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { LinkButton } from "@/components/ui/button";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { customer, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!customer || customer.role !== "admin")) router.push("/login");
  }, [customer, loading, router]);

  if (loading) return <p className="text-white/60">Checking admin access...</p>;
  if (!customer || customer.role !== "admin") {
    return (
      <div className="rounded-md border border-white/10 bg-white/[0.04] p-6">
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-white/60">Login with the demo admin account to view this area.</p>
        <LinkButton href="/login" className="mt-5">Login</LinkButton>
      </div>
    );
  }

  return <>{children}</>;
}
