import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Globe, CreditCard, Bell, Shield, Save, Wrench, AlertTriangle, Fingerprint } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBiometricsEnabled } from "@/hooks/useAppSetting";

const AdminSettings = () => {
  const { toast } = useToast();
  const { enabled: biometricsEnabled, setEnabled: setBiometricsEnabled } = useBiometricsEnabled();
  const [settings, setSettings] = useState({
    companyName: "AtlastWave Travel and Tour",
    email: "admin@atlastwave.com",
    phone: "+233 XX XXX XXXX",
    address: "Accra, Ghana",
    website: "https://atlastwavetravelandtours.lovable.app",
    currency: "GHS",
    timezone: "GMT+0",
    emailNotifications: true,
    smsNotifications: true,
    autoConfirmBookings: false,
    requireEmailVerification: true,
  });

  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "We are performing scheduled maintenance. Please check back shortly."
  );
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();
      const value = (data?.value as { enabled?: boolean; message?: string }) || {};
      setMaintenanceEnabled(!!value.enabled);
      if (value.message) setMaintenanceMessage(value.message);
    };
    load();
  }, []);

  const persistMaintenance = async (enabled: boolean, message: string) => {
    setSavingMaintenance(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert(
        { key: "maintenance_mode", value: { enabled, message }, updated_at: new Date().toISOString() } as never,
        { onConflict: "key" }
      );
    setSavingMaintenance(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const onToggleMaintenance = async (next: boolean) => {
    const ok = await persistMaintenance(next, maintenanceMessage);
    if (ok) {
      setMaintenanceEnabled(next);
      toast({
        title: next ? "🛠️ Maintenance mode enabled" : "✅ Site is live",
        description: next ? "Visitors now see the maintenance page." : "All visitors can access the site again.",
      });
    }
  };

  const onSaveMaintenanceMessage = async () => {
    const ok = await persistMaintenance(maintenanceEnabled, maintenanceMessage);
    if (ok) toast({ title: "Maintenance message saved" });
  };

  const handleSave = () => {
    toast({ title: "Settings saved", description: "System settings have been updated." });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">System Settings</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Configure company profile, payment gateways, maintenance, and system preferences.</p>
          </div>
          <Button size="sm" onClick={handleSave}><Save className="w-4 h-4 mr-1.5" /> Save Changes</Button>
        </div>

        <Card className={`shadow-card rounded-xl border-2 ${maintenanceEnabled ? "border-destructive/40 bg-destructive/5" : "border-border/60"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Maintenance Mode
              {maintenanceEnabled && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                  <AlertTriangle className="w-3 h-3" /> Active
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-semibold text-foreground">Take the site offline for visitors</p>
                <p className="text-[11px] text-muted-foreground">Admins will still be able to access the dashboard. All other users see a maintenance screen.</p>
              </div>
              <Switch
                checked={maintenanceEnabled}
                disabled={savingMaintenance}
                onCheckedChange={onToggleMaintenance}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[12px]">Message shown to visitors</Label>
              <Textarea
                rows={3}
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="We are performing scheduled maintenance..."
              />
              <Button size="sm" variant="secondary" onClick={onSaveMaintenanceMessage} disabled={savingMaintenance}>
                Save message
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] flex items-center gap-2"><Globe className="w-4 h-4" /> Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Company Name</Label><Input value={settings.companyName} onChange={e => setSettings(s => ({ ...s, companyName: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={settings.email} onChange={e => setSettings(s => ({ ...s, email: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Address</Label><Input value={settings.address} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Website</Label><Input value={settings.website} onChange={e => setSettings(s => ({ ...s, website: e.target.value }))} /></div>
            </CardContent>
          </Card>

          <Card className="shadow-card rounded-xl border border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment & Regional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Default Currency</Label><Input value={settings.currency} onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Timezone</Label><Input value={settings.timezone} onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))} /></div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div><p className="text-[13px] font-semibold text-foreground">Auto-confirm Bookings</p><p className="text-[11px] text-muted-foreground">Automatically confirm new bookings</p></div>
                <Switch checked={settings.autoConfirmBookings} onCheckedChange={v => setSettings(s => ({ ...s, autoConfirmBookings: v }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card rounded-xl border border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-[13px] font-semibold text-foreground">Email Notifications</p><p className="text-[11px] text-muted-foreground">Send email alerts for events</p></div>
                <Switch checked={settings.emailNotifications} onCheckedChange={v => setSettings(s => ({ ...s, emailNotifications: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-[13px] font-semibold text-foreground">SMS Notifications</p><p className="text-[11px] text-muted-foreground">Send SMS alerts for events</p></div>
                <Switch checked={settings.smsNotifications} onCheckedChange={v => setSettings(s => ({ ...s, smsNotifications: v }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card rounded-xl border border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] flex items-center gap-2"><Shield className="w-4 h-4" /> Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-[13px] font-semibold text-foreground">Require Email Verification</p><p className="text-[11px] text-muted-foreground">Users must verify email before login</p></div>
                <Switch checked={settings.requireEmailVerification} onCheckedChange={v => setSettings(s => ({ ...s, requireEmailVerification: v }))} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <Fingerprint className="w-4 h-4 mt-0.5 text-primary" />
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Biometric Authentication</p>
                    <p className="text-[11px] text-muted-foreground">Allow users to enable fingerprint / Face ID sign-in on their devices.</p>
                  </div>
                </div>
                <Switch
                  checked={biometricsEnabled}
                  onCheckedChange={async (v) => {
                    const ok = await setBiometricsEnabled(v);
                    if (ok) toast({ title: v ? "Biometric login enabled" : "Biometric login disabled" });
                    else toast({ title: "Could not save", variant: "destructive" });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
