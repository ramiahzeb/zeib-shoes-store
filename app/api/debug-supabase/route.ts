import { NextResponse } from "next/server";
import { getSupabaseBrowserConfig } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function describeServerError(caught: unknown) {
  const error = caught as {
    message?: string;
    name?: string;
    code?: string;
    cause?: { message?: string };
  };
  const details = [
    error?.name && error.name !== "Error" ? `name ${error.name}` : "",
    error?.code ? `code ${error.code}` : "",
    error?.cause?.message ? `cause ${error.cause.message}` : ""
  ].filter(Boolean);
  return `${error?.message || String(caught)}${details.length ? ` (${details.join(", ")})` : ""}`;
}

export async function GET() {
  const config = getSupabaseBrowserConfig();

  if (!config.isComplete) {
    return NextResponse.json({
      supabaseUrlLoaded: config.hasUrl,
      supabaseKeyLoaded: config.hasKey,
      keyPrefix: config.keyPrefix || "not loaded",
      keySource: config.keySource,
      health: {
        status: "skipped",
        message: `Missing: ${config.missing.join(", ") || "Supabase config"}`
      }
    });
  }

  try {
    const response = await fetch(`${config.supabaseUrl}/auth/v1/health`, {
      method: "GET",
      cache: "no-store",
      headers: {
        apikey: config.supabaseKey,
        Authorization: `Bearer ${config.supabaseKey}`
      }
    });
    const body = (await response.text()).trim();

    return NextResponse.json({
      supabaseUrlLoaded: config.hasUrl,
      supabaseKeyLoaded: config.hasKey,
      keyPrefix: config.keyPrefix,
      keySource: config.keySource,
      health: {
        status: response.ok ? "success" : "error",
        message: `${response.status} ${response.statusText}${body ? ` - ${body.slice(0, 180)}` : ""}`
      }
    });
  } catch (caught) {
    return NextResponse.json({
      supabaseUrlLoaded: config.hasUrl,
      supabaseKeyLoaded: config.hasKey,
      keyPrefix: config.keyPrefix,
      keySource: config.keySource,
      health: {
        status: "error",
        message: describeServerError(caught)
      }
    });
  }
}
