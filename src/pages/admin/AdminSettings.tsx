import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, CreditCard, Bell, Shield, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    companyName: "AtlastWave Travel and Tour",
    email: "admin@atlastwave.com",
    phone: "+233 XX XXX XXXX",
    address: "Accra, Ghana",
    website: "https://atlastwavetravelandtours.lovable.app",
    currency: "GHS",
    timezone: "GMT+0",
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: true,
    autoConfirmBookings: false,
    requireEmailVerification: true,
  });

  const handleSave = () => {
    toast({ title: "Settings saved", description: "System settings have been updated." });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">System Settings</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Configure company profile, payment gateways, and system preferences.</p>
          </div>
          <Button size="sm" onClick={handleSave}><Save className="w-4 h-4 mr-1.5" /> Save Changes</Button>
        </div>

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
              <div className="flex items-center justify-between">
                <div><p className="text-[13px] font-semibold text-foreground">Maintenance Mode</p><p className="text-[11px] text-muted-foreground">Temporarily disable public access</p></div>
                <Switch checked={settings.maintenanceMode} onCheckedChange={v => setSettings(s => ({ ...s, maintenanceMode: v }))} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
