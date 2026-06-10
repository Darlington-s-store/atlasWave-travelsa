import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Json = Record<string, unknown>;

export function useAppSetting<T extends Json = Json>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (mounted) {
        if (data?.value) setValue(data.value as T);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`app_settings_${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings", filter: `key=eq.${key}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as { value?: T } | undefined;
          if (row?.value) setValue(row.value);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [key]);

  const save = async (next: T) => {
    setValue(next);
    const { error } = await supabase
      .from("app_settings")
      .upsert(
        { key, value: next as unknown as Json, updated_at: new Date().toISOString() } as never,
        { onConflict: "key" }
      );
    return !error;
  };

  return { value, loading, save };
}

export function useBiometricsEnabled() {
  const { value, loading, save } = useAppSetting<{ enabled: boolean }>("biometrics_enabled", { enabled: false });
  return {
    enabled: !!value.enabled,
    loading,
    setEnabled: (enabled: boolean) => save({ enabled }),
  };
}
