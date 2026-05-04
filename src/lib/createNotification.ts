import { supabase } from "@/integrations/supabase/client";

interface CreateNotificationParams {
  audience: "user" | "admin" | "all";
  userId?: string | null;
  title: string;
  body?: string;
  type?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await supabase.from("notifications").insert([{
      audience: params.audience,
      user_id: params.userId ?? null,
      title: params.title,
      body: params.body ?? null,
      type: params.type ?? "info",
      link: params.link ?? null,
      metadata: params.metadata ?? {},
    }] as never);
  } catch (e) {
    console.warn("createNotification failed", e);
  }
}
