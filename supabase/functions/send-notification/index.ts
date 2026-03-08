import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NotificationPayload {
  type: string;
  recipientEmail: string;
  recipientName: string;
  data: Record<string, string>;
}

const templates: Record<string, (data: Record<string, string>, name: string) => { subject: string; html: string }> = {
  invoice_ready: (data, name) => ({
    subject: `Invoice ${data.invoiceNumber} — Payment Confirmed`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: linear-gradient(135deg, #0A3D62, #1ABC9C); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">🧾 Invoice & Payment Receipt</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your payment has been confirmed and an invoice has been generated.</p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 6px 0; font-size: 13px; color: #6B7280;">Invoice Number: <strong style="color: #2C3E50;">${data.invoiceNumber}</strong></p>
            <p style="margin: 6px 0; font-size: 13px; color: #6B7280;">Amount: <strong style="color: #1ABC9C;">${data.currency} ${data.amount}</strong></p>
            <p style="margin: 6px 0; font-size: 13px; color: #6B7280;">Description: <strong style="color: #2C3E50;">${data.description || 'Service Payment'}</strong></p>
            <p style="margin: 6px 0; font-size: 13px; color: #6B7280;">Payment Method: <strong style="color: #2C3E50;">${data.paymentMethod || 'N/A'}</strong></p>
            <p style="margin: 6px 0; font-size: 13px; color: #6B7280;">Date: <strong style="color: #2C3E50;">${data.date}</strong></p>
          </div>
          <p style="color: #6B7280; font-size: 13px;">You can download your full receipt from your dashboard at any time.</p>
          <div style="margin-top: 24px; text-align: center;">
            <p style="color: #9CA3AF; font-size: 11px;">AtlasWave — Thank you for your payment.</p>
          </div>
        </div>
      </div>
    `,
  }),
  application_status_update: (data, name) => ({
    subject: `Application Update — ${data.title}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: linear-gradient(135deg, #0A3D62, #1ABC9C); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Application Status Update</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your application <strong style="color: #2C3E50;">"${data.title}"</strong> has been updated.</p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Type: <strong style="color: #2C3E50;">${data.type}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Previous Status: <strong style="color: #6B7280;">${data.previousStatus}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">New Status: <strong style="color: #1ABC9C;">${data.newStatus}</strong></p>
          </div>
          ${data.notes ? `<p style="color: #6B7280; font-size: 13px;">Admin notes: ${data.notes}</p>` : ''}
          <p style="color: #6B7280; font-size: 13px; margin-top: 16px;">Log in to your dashboard to view full details.</p>
        </div>
      </div>
    `,
  }),
  booking_status_update: (data, name) => ({
    subject: `Booking Update — ${data.route}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: linear-gradient(135deg, #0A3D62, #F4B400); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Booking Status Update</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your ${data.bookingType} booking has been updated.</p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Route: <strong style="color: #2C3E50;">${data.route}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Date: <strong style="color: #2C3E50;">${data.date}</strong></p>
            ${data.provider ? `<p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Provider: <strong style="color: #2C3E50;">${data.provider}</strong></p>` : ''}
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">New Status: <strong style="color: #1ABC9C;">${data.newStatus}</strong></p>
          </div>
          <p style="color: #6B7280; font-size: 13px;">Log in to your dashboard to view full details.</p>
        </div>
      </div>
    `,
  }),
  refund_approved: (data, name) => ({
    subject: `Refund Approved — ${data.refundId}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: linear-gradient(135deg, #0A3D62, #1ABC9C); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Refund Approved ✓</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your refund request <strong>${data.refundId}</strong> for <strong>${data.amount}</strong> has been approved.</p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Service: <strong style="color: #2C3E50;">${data.service}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Method: <strong style="color: #2C3E50;">${data.method}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Expected: <strong style="color: #1ABC9C;">3-5 business days</strong></p>
          </div>
        </div>
      </div>
    `,
  }),
  refund_rejected: (data, name) => ({
    subject: `Refund Update — ${data.refundId}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: #0A3D62; padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Refund Update</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 14px;">Your refund request <strong>${data.refundId}</strong> could not be approved. Reason: ${data.reason || "Does not meet refund policy criteria."}</p>
        </div>
      </div>
    `,
  }),
  refund_processed: (data, name) => ({
    subject: `Refund Processed — ${data.amount} sent`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: linear-gradient(135deg, #1ABC9C, #0A3D62); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">💰 Refund Sent!</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 14px;">Your refund of <strong style="color: #1ABC9C;">${data.amount}</strong> has been processed via ${data.method}.</p>
        </div>
      </div>
    `,
  }),
  shipment_update: (data, name) => ({
    subject: `Shipment Update — ${data.trackingId}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: #0A3D62; padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">📦 Shipment Update</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 14px;">Your shipment <strong>${data.trackingId}</strong> status: <strong style="color: #1ABC9C;">${data.status}</strong></p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Route: ${data.origin} → ${data.destination}</p>
          </div>
        </div>
      </div>
    `,
  }),
  consultation_confirmed: (data, name) => ({
    subject: `Consultation Confirmed — ${data.date}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: linear-gradient(135deg, #0A3D62, #F4B400); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">📅 Consultation Confirmed</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 14px;">Your ${data.type} consultation on ${data.date} at ${data.time} (${data.duration}) is confirmed.</p>
        </div>
      </div>
    `,
  }),
  consultation_cancelled: (data, name) => ({
    subject: `Consultation Cancelled`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: #0A3D62; padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Consultation Cancelled</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 14px;">Your consultation on ${data.date} at ${data.time} has been cancelled.</p>
        </div>
      </div>
    `,
  }),
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const payload: NotificationPayload = await req.json();
    const { type, recipientEmail, recipientName, data } = payload;

    if (!type || !recipientEmail || !templates[type]) {
      return new Response(
        JSON.stringify({ error: 'Invalid notification type or missing email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const template = templates[type];
    const { subject, html } = template(data, recipientName);

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AtlasWave <onboarding@resend.dev>',
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: resendData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Email sent via Resend:
      To: ${recipientEmail}
      Subject: ${subject}
      Type: ${type}
      Resend ID: ${resendData.id}
    `);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent to ${recipientEmail}`,
        type,
        subject,
        emailId: resendData.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process notification', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
