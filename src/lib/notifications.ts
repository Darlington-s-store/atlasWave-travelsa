import { supabase } from "@/integrations/supabase/client";

export type NotificationType =
  | "invoice_ready"
  | "refund_approved"
  | "refund_rejected"
  | "refund_processed"
  | "shipment_update"
  | "consultation_confirmed"
  | "consultation_cancelled";

interface SendNotificationParams {
  type: NotificationType;
  recipientEmail: string;
  recipientName: string;
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
