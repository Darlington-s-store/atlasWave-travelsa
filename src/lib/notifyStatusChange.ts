import { sendNotification } from "@/lib/notifications";
import { createNotification } from "@/lib/createNotification";

interface NotifyStatusChangeParams {
  type: "application_status_update" | "booking_status_update";
  userId: string;
  data: Record<string, string>;
}

export async function notifyStatusChange({ type, userId, data }: NotifyStatusChangeParams) {
  try {
    const isBooking = type === "booking_status_update";
    await createNotification({
      audience: "user",
      userId,
      title: isBooking ? "Booking status updated" : "Application status updated",
      body: isBooking
        ? `${data.bookingType || "Booking"} for ${data.route || "your trip"} is now ${data.newStatus}.`
        : `${data.title || "Your application"} is now ${data.newStatus}.`,
      type: isBooking ? "booking" : "application",
      link: "/dashboard",
      metadata: data,
    });

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
