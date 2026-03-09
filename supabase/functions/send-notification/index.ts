import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRAND_NAME = "Atlast Wave Travel and Tours";
const DEFAULT_SMS_SENDER = "AtlastWave";

type NotificationChannel = "email" | "sms" | "both";

interface NotificationPayload {
  type: string;
  userId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  channel?: NotificationChannel;
  data: Record<string, string>;
}

type NotificationTemplate = {
  subject: string;
  html: string;
  sms: string;
};

const wrapEmail = (title: string, accent: string, body: string) => `
  <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
    <div style="background: ${accent}; padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 22px;">${title}</h1>
    </div>
    <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
      ${body}
    </div>
  </div>
`;

const templates: Record<string, (data: Record<string, string>, name: string) => NotificationTemplate> = {
  invoice_ready: (data, name) => ({
    subject: `Invoice ${data.invoiceNumber} - Payment Confirmed`,
    html: wrapEmail(
      "Invoice and Payment Receipt",
      "linear-gradient(135deg, #0A3D62, #1ABC9C)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your payment has been confirmed and an invoice has been generated.</p>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 6px 0; font-size: 13px; color: #6B7280;">Invoice Number: <strong style="color: #2C3E50;">${data.invoiceNumber}</strong></p>
          <p style="margin: 6px 0; font-size: 13px; color: #6B7280;">Amount: <strong style="color: #1ABC9C;">${data.currency} ${data.amount}</strong></p>
          <p style="margin: 6px 0; font-size: 13px; color: #6B7280;">Description: <strong style="color: #2C3E50;">${data.description || "Service Payment"}</strong></p>
          <p style="margin: 6px 0; font-size: 13px; color: #6B7280;">Payment Method: <strong style="color: #2C3E50;">${data.paymentMethod || "N/A"}</strong></p>
          <p style="margin: 6px 0; font-size: 13px; color: #6B7280;">Date: <strong style="color: #2C3E50;">${data.date}</strong></p>
        </div>
        <p style="color: #6B7280; font-size: 13px;">You can download your full receipt from your dashboard at any time.</p>
        <div style="margin-top: 24px; text-align: center;">
          <p style="color: #9CA3AF; font-size: 11px;">${BRAND_NAME} - Thank you for your payment.</p>
        </div>
      `,
    ),
    sms: `${BRAND_NAME}: Payment confirmed. Invoice ${data.invoiceNumber} for ${data.currency} ${data.amount}.`,
  }),
  application_received: (data, name) => ({
    subject: `Application Received - ${data.title}`,
    html: wrapEmail(
      "Application Received",
      "linear-gradient(135deg, #0A3D62, #1ABC9C)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">We have received your application and our team will review it shortly.</p>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Application: <strong style="color: #2C3E50;">${data.title}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Type: <strong style="color: #2C3E50;">${data.type}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Status: <strong style="color: #1ABC9C;">${data.status}</strong></p>
        </div>
        <p style="color: #6B7280; font-size: 13px;">You will receive another update as soon as the status changes.</p>
      `,
    ),
    sms: `${BRAND_NAME}: We received your ${data.type} application "${data.title}". Status: ${data.status}.`,
  }),
  application_status_update: (data, name) => ({
    subject: `Application Update - ${data.title}`,
    html: wrapEmail(
      "Application Status Update",
      "linear-gradient(135deg, #0A3D62, #1ABC9C)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your application <strong style="color: #2C3E50;">"${data.title}"</strong> has been updated.</p>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Type: <strong style="color: #2C3E50;">${data.type}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Previous Status: <strong style="color: #6B7280;">${data.previousStatus}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">New Status: <strong style="color: #1ABC9C;">${data.newStatus}</strong></p>
        </div>
        ${data.notes ? `<p style="color: #6B7280; font-size: 13px;">Admin notes: ${data.notes}</p>` : ""}
        <p style="color: #6B7280; font-size: 13px; margin-top: 16px;">Log in to your dashboard to view full details.</p>
      `,
    ),
    sms: `${BRAND_NAME}: ${data.title} is now ${data.newStatus}. Previous status: ${data.previousStatus}.`,
  }),
  booking_received: (data, name) => ({
    subject: `Booking Received - ${data.route}`,
    html: wrapEmail(
      "Booking Received",
      "linear-gradient(135deg, #0A3D62, #F4B400)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your ${data.bookingType} booking request has been received.</p>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Route: <strong style="color: #2C3E50;">${data.route}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Date: <strong style="color: #2C3E50;">${data.date}</strong></p>
          ${data.provider ? `<p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Provider: <strong style="color: #2C3E50;">${data.provider}</strong></p>` : ""}
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Status: <strong style="color: #1ABC9C;">${data.status}</strong></p>
        </div>
      `,
    ),
    sms: `${BRAND_NAME}: Your ${data.bookingType} booking for ${data.route} on ${data.date} has been received.`,
  }),
  booking_status_update: (data, name) => ({
    subject: `Booking Update - ${data.route}`,
    html: wrapEmail(
      "Booking Status Update",
      "linear-gradient(135deg, #0A3D62, #F4B400)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your ${data.bookingType} booking has been updated.</p>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Route: <strong style="color: #2C3E50;">${data.route}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Date: <strong style="color: #2C3E50;">${data.date}</strong></p>
          ${data.provider ? `<p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Provider: <strong style="color: #2C3E50;">${data.provider}</strong></p>` : ""}
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">New Status: <strong style="color: #1ABC9C;">${data.newStatus}</strong></p>
        </div>
        <p style="color: #6B7280; font-size: 13px;">Log in to your dashboard to view full details.</p>
      `,
    ),
    sms: `${BRAND_NAME}: Your ${data.bookingType} booking for ${data.route} is now ${data.newStatus}.`,
  }),
  consultation_booked: (data, name) => ({
    subject: `Consultation Booked - ${data.date}`,
    html: wrapEmail(
      "Consultation Booked",
      "linear-gradient(135deg, #0A3D62, #F4B400)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px;">Your ${data.type} consultation has been booked successfully.</p>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Date: <strong style="color: #2C3E50;">${data.date}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Time: <strong style="color: #2C3E50;">${data.time}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Duration: <strong style="color: #2C3E50;">${data.duration}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Status: <strong style="color: #1ABC9C;">${data.status}</strong></p>
        </div>
      `,
    ),
    sms: `${BRAND_NAME}: Your ${data.type} consultation is booked for ${data.date} at ${data.time}.`,
  }),
  refund_approved: (data, name) => ({
    subject: `Refund Approved - ${data.refundId}`,
    html: wrapEmail(
      "Refund Approved",
      "linear-gradient(135deg, #0A3D62, #1ABC9C)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your refund request <strong>${data.refundId}</strong> for <strong>${data.amount}</strong> has been approved.</p>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Service: <strong style="color: #2C3E50;">${data.service}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Method: <strong style="color: #2C3E50;">${data.method}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Expected: <strong style="color: #1ABC9C;">3-5 business days</strong></p>
        </div>
      `,
    ),
    sms: `${BRAND_NAME}: Refund ${data.refundId} approved for ${data.amount}.`,
  }),
  refund_rejected: (data, name) => ({
    subject: `Refund Update - ${data.refundId}`,
    html: wrapEmail(
      "Refund Update",
      "#0A3D62",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px;">Your refund request <strong>${data.refundId}</strong> could not be approved. Reason: ${data.reason || "Does not meet refund policy criteria."}</p>
      `,
    ),
    sms: `${BRAND_NAME}: Refund ${data.refundId} was rejected. ${data.reason || "Please contact support for details."}`,
  }),
  refund_processed: (data, name) => ({
    subject: `Refund Processed - ${data.amount} sent`,
    html: wrapEmail(
      "Refund Sent",
      "linear-gradient(135deg, #1ABC9C, #0A3D62)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px;">Your refund of <strong style="color: #1ABC9C;">${data.amount}</strong> has been processed via ${data.method}.</p>
      `,
    ),
    sms: `${BRAND_NAME}: Your refund of ${data.amount} has been processed via ${data.method}.`,
  }),
  shipment_update: (data, name) => ({
    subject: `Shipment Update - ${data.trackingId}`,
    html: wrapEmail(
      "Shipment Update",
      "#0A3D62",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px;">Your shipment <strong>${data.trackingId}</strong> status: <strong style="color: #1ABC9C;">${data.status}</strong></p>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Route: ${data.origin} to ${data.destination}</p>
        </div>
      `,
    ),
    sms: `${BRAND_NAME}: Shipment ${data.trackingId} is now ${data.status}. Route: ${data.origin} to ${data.destination}.`,
  }),
  consultation_confirmed: (data, name) => ({
    subject: `Consultation Confirmed - ${data.date}`,
    html: wrapEmail(
      "Consultation Confirmed",
      "linear-gradient(135deg, #0A3D62, #F4B400)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px;">Your ${data.type} consultation on ${data.date} at ${data.time} (${data.duration}) is confirmed.</p>
      `,
    ),
    sms: `${BRAND_NAME}: Consultation confirmed for ${data.date} at ${data.time}.`,
  }),
  consultation_cancelled: (data, name) => ({
    subject: "Consultation Cancelled",
    html: wrapEmail(
      "Consultation Cancelled",
      "#0A3D62",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px;">Your consultation on ${data.date} at ${data.time} has been cancelled.</p>
      `,
    ),
    sms: `${BRAND_NAME}: Consultation on ${data.date} at ${data.time} has been cancelled.`,
  }),
  payment_submitted: (data, name) => ({
    subject: `Payment Submitted - ${data.reference}`,
    html: wrapEmail(
      "Payment Submitted",
      "linear-gradient(135deg, #0A3D62, #1ABC9C)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px;">We have received your payment submission and it is awaiting confirmation.</p>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Reference: <strong style="color: #2C3E50;">${data.reference}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Amount: <strong style="color: #1ABC9C;">${data.currency} ${data.amount}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Service: <strong style="color: #2C3E50;">${data.description || "Payment"}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Status: <strong style="color: #2C3E50;">${data.status}</strong></p>
        </div>
      `,
    ),
    sms: `${BRAND_NAME}: Payment ${data.reference} for ${data.currency} ${data.amount} has been submitted and is ${data.status}.`,
  }),
  payment_status_update: (data, name) => ({
    subject: `Payment Update - ${data.reference}`,
    html: wrapEmail(
      "Payment Status Update",
      "linear-gradient(135deg, #0A3D62, #1ABC9C)",
      `
        <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
        <p style="color: #6B7280; font-size: 14px;">Your payment status has changed.</p>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Reference: <strong style="color: #2C3E50;">${data.reference}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Amount: <strong style="color: #1ABC9C;">${data.currency} ${data.amount}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Previous Status: <strong style="color: #2C3E50;">${data.previousStatus}</strong></p>
          <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">New Status: <strong style="color: #1ABC9C;">${data.newStatus}</strong></p>
          ${data.description ? `<p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Service: <strong style="color: #2C3E50;">${data.description}</strong></p>` : ""}
        </div>
      `,
    ),
    sms: `${BRAND_NAME}: Payment ${data.reference} is now ${data.newStatus}. Previous status: ${data.previousStatus}.`,
  }),
};

function normalizePhoneNumber(phone: string) {
  return phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

async function resolveRecipients(payload: NotificationPayload) {
  let recipientEmail = payload.recipientEmail?.trim() || undefined;
  let recipientPhone = payload.recipientPhone?.trim() || undefined;
  let recipientName = payload.recipientName?.trim() || "User";

  if (!payload.userId || (recipientEmail && recipientPhone && recipientName !== "User")) {
    return { recipientEmail, recipientPhone, recipientName };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return { recipientEmail, recipientPhone, recipientName };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const [profileResult, authResult] = await Promise.all([
    !recipientPhone || recipientName === "User"
      ? supabaseAdmin.from("profiles").select("full_name, phone").eq("id", payload.userId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    !recipientEmail
      ? supabaseAdmin.auth.admin.getUserById(payload.userId)
      : Promise.resolve({ data: { user: null }, error: null }),
  ]);

  if (profileResult.error) {
    console.error("Failed to load profile for notification:", profileResult.error);
  } else if (profileResult.data) {
    recipientPhone = recipientPhone || profileResult.data.phone || undefined;
    recipientName = recipientName === "User" ? profileResult.data.full_name || recipientName : recipientName;
  }

  if (authResult.error) {
    console.error("Failed to load auth user for notification:", authResult.error);
  } else {
    recipientEmail = recipientEmail || authResult.data.user?.email || undefined;
  }

  return { recipientEmail, recipientPhone, recipientName };
}

async function sendEmail(resendApiKey: string, to: string, subject: string, html: string) {
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${BRAND_NAME} <${fromEmail}>`,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Failed to send email");
  }

  return data;
}

async function sendSms(arkeselApiKey: string, sender: string, to: string, message: string) {
  const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
    method: "POST",
    headers: {
      "api-key": arkeselApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender,
      message,
      recipients: [to],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Failed to send SMS");
  }

  return data;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { type, data } = payload;
    const channel = payload.channel || "email";

    if (!type || !templates[type]) {
      return new Response(
        JSON.stringify({ error: "Invalid notification type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const requestedEmail = channel === "email" || channel === "both";
    const requestedSms = channel === "sms" || channel === "both";
    const { recipientEmail, recipientPhone, recipientName } = await resolveRecipients(payload);
    const wantsEmail = requestedEmail && Boolean(recipientEmail);
    const wantsSms = requestedSms && Boolean(recipientPhone);

    if (channel === "email" && !recipientEmail) {
      return new Response(
        JSON.stringify({ error: "recipientEmail is required for email notifications" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (channel === "sms" && !recipientPhone) {
      return new Response(
        JSON.stringify({ error: "recipientPhone is required for SMS notifications" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!wantsEmail && !wantsSms) {
      return new Response(
        JSON.stringify({ error: "No deliverable email address or phone number found for this notification" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const template = templates[type](data, recipientName);
    const results: Record<string, unknown> = {};

    if (wantsEmail) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is not configured");
      }

      results.email = await sendEmail(resendApiKey, recipientEmail!, template.subject, template.html);
    }

    if (wantsSms) {
      const arkeselApiKey = Deno.env.get("ARKESEL_API_KEY");
      if (!arkeselApiKey) {
        throw new Error("ARKESEL_API_KEY is not configured");
      }

      const sender = Deno.env.get("ARKESEL_SENDER_ID") || DEFAULT_SMS_SENDER;
      results.sms = await sendSms(arkeselApiKey, sender, normalizePhoneNumber(recipientPhone!), template.sms);
    }

    return new Response(
      JSON.stringify({
        success: true,
        type,
        channel: wantsEmail && wantsSms ? "both" : wantsEmail ? "email" : "sms",
        subject: template.subject,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process notification",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
