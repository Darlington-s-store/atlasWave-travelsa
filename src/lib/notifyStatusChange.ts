import { sendNotification } from "@/lib/notifications";

interface NotifyStatusChangeParams {
  type: "application_status_update" | "booking_status_update";
  userId: string;
  data: Record<string, string>;
}

export async function notifyStatusChange({ type, userId, data }: NotifyStatusChangeParams) {
  try {
    await sendNotification({
      type,
      userId,
      channel: "both",
      data,
    });
  } catch (err) {
    console.error("Failed to send status notification:", err);
  }
}
