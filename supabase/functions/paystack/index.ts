declare const Deno: { env: { get(key: string): string | undefined } };

// @ts-ignore Deno URL imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore Deno URL imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET) throw new Error("PAYSTACK_SECRET_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const { action, ...body } = await req.json();

    // ── Initialize transaction ──
    if (action === "initialize") {
      const { email, amount, currency, description, user_id, callback_url } = body;

      if (!email || !amount || !user_id) {
        return new Response(JSON.stringify({ error: "email, amount, and user_id are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Amount in kobo/pesewas (smallest unit)
      const amountInSmallest = Math.round(Number(amount) * 100);

      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInSmallest,
          currency: currency || "GHS",
          callback_url: callback_url || undefined,
          metadata: {
            user_id,
            description: description || "Service Payment",
          },
        }),
      });

      const data = await res.json();
      if (!data.status) {
        return new Response(JSON.stringify({ error: data.message || "Paystack initialization failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Verify transaction ──
    if (action === "verify") {
      const { reference } = body;
      if (!reference) {
        return new Response(JSON.stringify({ error: "reference is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      });

      const data = await res.json();
      if (!data.status) {
        return new Response(JSON.stringify({ error: data.message || "Verification failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const txn = data.data;
      const status = txn.status === "success" ? "completed" : txn.status === "failed" ? "failed" : "pending";
      const amountMajor = txn.amount / 100;

      // Save to database
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const userId = txn.metadata?.user_id;
      if (userId) {
        const { data: payment, error } = await supabase.from("payments").insert({
          user_id: userId,
          amount: amountMajor,
          currency: txn.currency || "GHS",
          description: txn.metadata?.description || "Paystack Payment",
          payment_method: txn.channel === "mobile_money" ? "Mobile Money" : "Card",
          reference: txn.reference,
          status,
        }).select().single();

        if (error) {
          console.error("Failed to save payment:", error);
        }

        return new Response(JSON.stringify({
          status,
          amount: amountMajor,
          currency: txn.currency,
          reference: txn.reference,
          payment_id: payment?.id,
          channel: txn.channel,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ status, amount: amountMajor, reference: txn.reference }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use 'initialize' or 'verify'." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Paystack error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
