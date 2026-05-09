import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { playPing, unlockAudio } from "@/lib/notificationSound";

export type NotificationRow = {
  id: string;
  user_id: string | null;
  audience: "user" | "admin" | "all";
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
};

interface Options {
  audience: "user" | "admin";
  userId?: string | null;
}

export function useNotifications({ audience, userId }: Options) {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const readyForSound = useRef(false);

  const fetchAll = useCallback(async () => {
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (audience === "user") {
      if (!userId) {
        setItems([]);
        setLoading(false);
        return;
      }
      query = query.in("audience", ["user", "all"]).or(`user_id.eq.${userId},audience.eq.all`);
    } else {
      query = query.in("audience", ["admin", "all"]);
    }

    const { data } = await query;
    setItems((data as NotificationRow[]) || []);
    setLoading(false);
  }, [audience, userId]);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel(`notifications_${audience}_${userId ?? "anon"}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const row = payload.new as NotificationRow;
          const matches =
            (audience === "admin" && (row.audience === "admin" || row.audience === "all")) ||
            (audience === "user" && (row.audience === "all" || (row.audience === "user" && row.user_id === userId)));
          if (!matches) return;
          setItems((prev) => (prev.some((n) => n.id === row.id) ? prev : [row, ...prev].slice(0, 50)));
          if (readyForSound.current) playPing();
        }
      )
      .subscribe();

    readyForSound.current = true;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll, audience, userId]);

  // Unlock audio on first user interaction so sounds play later
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }, []);

  const markAllRead = useCallback(async () => {
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
  }, [items]);

  const unreadCount = items.filter((n) => !n.read).length;

  return { items, loading, unreadCount, markAsRead, markAllRead, refetch: fetchAll };
}
