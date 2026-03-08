import { supabase } from "@/integrations/supabase/client";

interface NotifyStatusChangeParams {
  type: "application_status_update" | "booking_status_update";
  userId: string;
  data: Record<string, string>;
}

export async function notifyStatusChange({ type, userId, data }: NotifyStatusChangeParams) {
  try {
    // Look up the user's profile to get their name, and email from auth
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    const recipientName = profile?.full_name || "User";
    // We can't access auth.users from client, so use user_id as fallback identifier
    // The edge function logs the notification; in production you'd wire up actual email sending
    const recipientEmail = data.email || `user-${userId.slice(0, 8)}@atlaswave.com`;

    await supabase.functions.invoke("send-notification", {
      body: {
        type,
        recipientEmail,
        recipientName,
        data,
      },
    });
  } catch (err) {
    console.error("Failed to send status notification:", err);
  }
}
