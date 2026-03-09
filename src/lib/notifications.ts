import { supabase } from "@/integrations/supabase/client";

export type NotificationType =
  | "application_received"
  | "application_status_update"
  | "booking_received"
  | "booking_status_update"
  | "consultation_booked"
  | "invoice_ready"
  | "payment_status_update"
  | "payment_submitted"
  | "refund_approved"
  | "refund_rejected"
  | "refund_processed"
  | "shipment_update"
  | "consultation_confirmed"
  | "consultation_cancelled";

interface SendNotificationParams {
  type: NotificationType;
  userId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  channel?: "email" | "sms" | "both";
  data: Record<string, string>;
}

export async function sendNotification(params: SendNotificationParams) {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification", {
      body: params,
    });

    if (error) {
      console.error("Notification error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send notification:", err);
    return { success: false, error: "Network error" };
  }
}
