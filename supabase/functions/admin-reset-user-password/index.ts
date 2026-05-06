// @ts-expect-error deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND = "AtlasWave Travel and Tour";

function generatePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + digits + symbols;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let pwd = pick(upper) + pick(lower) + pick(digits) + pick(symbols);
  for (let i = 0; i < 10; i++) pwd += pick(all);
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

function emailHtml(name: string, password: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#2C3E50;line-height:1.6">
<p style="margin:0 0 12px;font-size:13px;color:#6B7280">${BRAND}</p>
<h1 style="margin:0 0 16px;font-size:20px;color:#0A3D62">Your password has been reset</h1>
<p>Hi ${name || "there"},</p>
<p>An administrator has reset your account password. Please use the temporary password below to sign in, then change it immediately from your account settings.</p>
<div style="background:#F4F6F8;border-radius:8px;padding:16px;margin:18px 0;font-family:monospace;font-size:18px;letter-spacing:1px;text-align:center;color:#0A3D62"><strong>${password}</strong></div>
<p>If you did not request this, contact our support team right away.</p>
<p style="margin-top:24px;font-size:13px;color:#6B7280">Thanks,<br>${BRAND}</p>
</div>`;
}

function smsText(password: string) {
  return `${BRAND}: An admin reset your password. Temporary password: ${password}. Please change it after logging in.`;
}

function normalizePhone(p: string) {
  const t = p.replace(/[^\d+]/g, "");
  if (t.startsWith("+")) return t;
  if (t.startsWith("0")) return "+233" + t.slice(1);
  return "+" + t;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // @ts-expect-error deno
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    // @ts-expect-error deno
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    // @ts-expect-error deno
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    // @ts-expect-error deno
    const RESEND = Deno.env.get("RESEND_API_KEY");
    // @ts-expect-error deno
    const ARKESEL = Deno.env.get("ARKESEL_API_KEY");

    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId as string | undefined;
    if (!targetUserId) return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: target, error: getErr } = await admin.auth.admin.getUserById(targetUserId);
    if (getErr || !target?.user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const newPassword = generatePassword();
    const { error: updErr } = await admin.auth.admin.updateUserById(targetUserId, { password: newPassword });
    if (updErr) throw updErr;

    const { data: profile } = await admin.from("profiles").select("full_name, phone, email").eq("id", targetUserId).single();
    const name = profile?.full_name || "";
    const email = target.user.email || profile?.email || "";
    const phone = profile?.phone || "";

    const results: Record<string, unknown> = {};

    if (RESEND && email) {
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "AtlasWave <onboarding@resend.dev>",
            to: [email],
            subject: "Your password has been reset",
            html: emailHtml(name, newPassword),
          }),
        });
        results.email = await r.json().catch(() => ({ ok: r.ok }));
      } catch (e) { results.email_error = String(e); }
    }

    if (ARKESEL && phone) {
      try {
        const r = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
          method: "POST",
          headers: { "api-key": ARKESEL, "Content-Type": "application/json" },
          body: JSON.stringify({ sender: "AtlasWave", message: smsText(newPassword), recipients: [normalizePhone(phone)] }),
        });
        results.sms = await r.json().catch(() => ({ ok: r.ok }));
      } catch (e) { results.sms_error = String(e); }
    }

    // Notifications
    await admin.from("notifications").insert([
      { audience: "user", user_id: targetUserId, title: "Your password was reset", body: "An administrator reset your password. Check your email and SMS for the new temporary password.", type: "warning", link: "/dashboard" },
      { audience: "admin", title: "Password reset", body: `Reset password for ${name || email}`, type: "info", link: "/admin/users", metadata: { user_id: targetUserId } },
    ]);

    return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("admin-reset-user-password error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
