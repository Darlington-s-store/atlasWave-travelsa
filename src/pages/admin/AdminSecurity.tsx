import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Lock, Eye, Key, Activity, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const auditLogs = [
  { id: "1", action: "Admin Login", user: "admin@atlastwave.com", ip: "102.176.xx.xx", time: "2 min ago", status: "success" },
  { id: "2", action: "User Role Changed", user: "admin@atlastwave.com", ip: "102.176.xx.xx", time: "15 min ago", status: "success" },
  { id: "3", action: "Payment Verified", user: "admin@atlastwave.com", ip: "102.176.xx.xx", time: "1 hour ago", status: "success" },
  { id: "4", action: "Shipment Updated", user: "admin@atlastwave.com", ip: "102.176.xx.xx", time: "3 hours ago", status: "success" },
];

const AdminSecurity = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    twoFactor: false,
    sessionTimeout: true,
    ipWhitelist: false,
    auditLogging: true,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Security</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage 2FA, session controls, audit logs, and security monitoring.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "2FA Status", value: settings.twoFactor ? "Enabled" : "Disabled", icon: Key, bg: "bg-primary/10", color: "text-primary" },
            { label: "Sessions", value: "Active", icon: Activity, bg: "bg-secondary/15", color: "text-secondary" },
            { label: "Audit Logs", value: auditLogs.length, icon: Eye, bg: "bg-accent/15", color: "text-accent" },
            { label: "Threats", value: "0", icon: Shield, bg: "bg-secondary/15", color: "text-secondary" },
          ].map(s => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardHeader className="pb-3"><CardTitle className="text-[15px] flex items-center gap-2"><Lock className="w-4 h-4" /> Security Controls</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {[
                { key: "twoFactor", label: "Two-Factor Authentication", desc: "Require 2FA for admin accounts" },
                { key: "sessionTimeout", label: "Session Timeout", desc: "Auto-logout after 30 min inactivity" },
                { key: "ipWhitelist", label: "IP Whitelist", desc: "Restrict admin access by IP" },
                { key: "auditLogging", label: "Audit Logging", desc: "Log all admin actions" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={settings[item.key as keyof typeof settings]}
                    onCheckedChange={v => { setSettings(s => ({ ...s, [item.key]: v })); toast({ title: `${item.label} ${v ? "enabled" : "disabled"}` }); }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card rounded-xl border border-border/60">
            <CardHeader className="pb-3"><CardTitle className="text-[15px] flex items-center gap-2"><Activity className="w-4 h-4" /> Recent Audit Logs</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Action</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Time</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {auditLogs.map(log => (
                    <TableRow key={log.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div><span className="font-semibold text-[12px]">{log.action}</span><br/><span className="text-[10px] text-muted-foreground">{log.user}</span></div>
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{log.time}</TableCell>
                      <TableCell><Badge className="bg-secondary/15 text-secondary text-[10px]"><CheckCircle className="w-3 h-3 mr-1" />{log.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurity;
