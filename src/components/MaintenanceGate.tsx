import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

import logo from "@/assets/logo.jpeg";

interface MaintenanceValue {
  enabled?: boolean;
  message?: string;
}

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { isAdminAuthenticated } = useAdmin();
  const location = useLocation();
  const [maintenance, setMaintenance] = useState<MaintenanceValue>({ enabled: false });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();
      if (mounted) {
        setMaintenance((data?.value as MaintenanceValue) || { enabled: false });
        setLoaded(true);
      }
    };

    load();

    const channel = supabase
      .channel("app_settings_maintenance")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        (payload) => {
          const row = payload.new as { key?: string; value?: MaintenanceValue };
          if (row?.key === "maintenance_mode") {
            setMaintenance(row.value || { enabled: false });
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Always allow admins, admin routes, and admin login through
  const isAdminRoute = location.pathname.startsWith("/admin");
  const bypass = isAdminAuthenticated || isAdminRoute;

  if (!loaded) return <>{children}</>;
  if (!maintenance.enabled || bypass) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-secondary px-6 text-primary-foreground">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20">
          <img src={logo} alt="AtlasWave Logo" className="h-full w-full rounded-2xl object-cover shadow-2xl" />
        </div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
          AtlasWave Travel & Tours
        </p>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">We'll be right back</h1>
        <p className="text-base leading-relaxed text-primary-foreground/85">
          {maintenance.message ||
            "We're performing scheduled maintenance to bring you a better experience. Please check back shortly."}
        </p>
        <p className="mt-8 text-xs text-primary-foreground/60">
          Need urgent help? Email <a href="mailto:support@atlastwave.com" className="underline">support@atlastwave.com</a>
        </p>
      </div>
    </div>
  );
}
