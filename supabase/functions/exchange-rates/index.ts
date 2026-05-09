declare const Deno: { env: { get(key: string): string | undefined } };

// @ts-ignore Deno URL imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory cache (edge functions are short-lived, but helps within same instance)
let cachedRates: Record<string, number> | null = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { base = "USD", targets } = await req.json();

    const now = Date.now();
    if (!cachedRates || now - cacheTime > CACHE_TTL) {
      // Use free exchangerate API (no key needed)
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Exchange rate API error: ${res.status} ${text}`);
      }
      const data = await res.json();
      cachedRates = data.rates as Record<string, number>;
      cacheTime = now;
    }

    // Filter to requested targets if provided
    let rates = cachedRates!;
    if (targets && Array.isArray(targets)) {
      const filtered: Record<string, number> = {};
      for (const t of targets) {
        if (rates[t] !== undefined) filtered[t] = rates[t];
      }
      rates = filtered;
    }

    return new Response(JSON.stringify({ base, rates, updated_at: new Date(cacheTime).toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Exchange rate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
