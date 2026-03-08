import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: 'refund_approved' | 'refund_rejected' | 'refund_processed' | 'shipment_update' | 'consultation_confirmed' | 'consultation_cancelled';
  recipientEmail: string;
  recipientName: string;
  data: Record<string, string>;
}

const templates: Record<string, (data: Record<string, string>, name: string) => { subject: string; html: string }> = {
  refund_approved: (data, name) => ({
    subject: `Refund Approved — ${data.refundId}`,
    html: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: linear-gradient(135deg, #0A3D62, #1ABC9C); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">Refund Approved ✓</h1>
        </div>
        <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px;">
          <p style="color: #2C3E50; font-size: 15px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your refund request <strong style="color: #2C3E50;">${data.refundId}</strong> for <strong style="color: #2C3E50;">${data.amount}</strong> has been approved.</p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Service: <strong style="color: #2C3E50;">${data.service}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Method: <strong style="color: #2C3E50;">${data.method}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Expected: <strong style="color: #1ABC9C;">3-5 business days</strong></p>
          </div>
          <p style="color: #6B7280; font-size: 13px;">If you have questions, contact our support team.</p>
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
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">Your refund request <strong>${data.refundId}</strong> for ${data.service} could not be approved at this time.</p>
          <p style="color: #6B7280; font-size: 14px;">Reason: ${data.reason || "Does not meet refund policy criteria."}</p>
          <p style="color: #6B7280; font-size: 13px; margin-top: 20px;">You may contact us to discuss further options.</p>
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
          <p style="color: #6B7280; font-size: 14px;">Your refund of <strong style="color: #1ABC9C; font-size: 18px;">${data.amount}</strong> has been processed via ${data.method}.</p>
          <p style="color: #6B7280; font-size: 13px;">Transaction Reference: ${data.refundId}</p>
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
          <p style="color: #6B7280; font-size: 14px;">Your shipment <strong style="color: #0A3D62;">${data.trackingId}</strong> status has been updated.</p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Route: <strong style="color: #2C3E50;">${data.origin} → ${data.destination}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Carrier: <strong style="color: #2C3E50;">${data.carrier}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Status: <strong style="color: #1ABC9C;">${data.status}</strong></p>
          </div>
          <a href="${data.trackingUrl || '#'}" style="display: inline-block; background: #0A3D62; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">Track Shipment</a>
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
          <p style="color: #6B7280; font-size: 14px;">Your consultation has been confirmed.</p>
          <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Type: <strong style="color: #2C3E50;">${data.type}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Date: <strong style="color: #2C3E50;">${data.date}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Time: <strong style="color: #2C3E50;">${data.time}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #6B7280;">Duration: <strong style="color: #2C3E50;">${data.duration}</strong></p>
          </div>
          <p style="color: #6B7280; font-size: 13px;">Need to reschedule? Visit your dashboard or contact us.</p>
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
          <p style="color: #6B7280; font-size: 14px;">Your consultation on <strong>${data.date}</strong> at <strong>${data.time}</strong> has been cancelled.</p>
          <p style="color: #6B7280; font-size: 13px; margin-top: 16px;">If this was a mistake, please rebook through your dashboard.</p>
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

    // Log the notification (in production, integrate with an email service)
    console.log(`📧 Email notification queued:
      To: ${recipientEmail}
      Subject: ${subject}
      Type: ${type}
    `);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification queued for ${recipientEmail}`,
        type,
        subject,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
