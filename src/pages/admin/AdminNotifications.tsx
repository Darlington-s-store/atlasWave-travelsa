import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Bell, Mail, MessageSquare, Plus, Send, Pencil, Trash2, Inbox,
  CheckCircle, Clock, Plane, Globe, Package, CreditCard, Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationTemplate {
  id: string;
  name: string;
  channel: "email" | "sms";
  subject?: string;
  body: string;
  category: string;
  active: boolean;
}

interface AutomatedAlert {
  id: string;
  event: string;
  description: string;
  channel: "email" | "sms" | "both";
  templateId: string;
  active: boolean;
}

const CATEGORIES = ["Booking", "Visa", "Work Permit", "Shipment", "Payment", "Consultation", "General"];

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  { id: "t1", name: "Booking Confirmation", channel: "email", subject: "Your booking has been confirmed", body: "Dear {{name}},\n\nYour {{booking_type}} booking ({{booking_id}}) has been confirmed.\n\nRoute: {{route}}\nDate: {{date}}\n\nThank you for choosing AtlastWave Travel and Tour!", category: "Booking", active: true },
  { id: "t2", name: "Booking Confirmation SMS", channel: "sms", body: "AtlastWave Travel and Tour: Your {{booking_type}} booking {{booking_id}} is confirmed for {{date}}. Ref: {{route}}", category: "Booking", active: true },
  { id: "t3", name: "Visa Status Update", channel: "email", subject: "Visa Application Update - {{status}}", body: "Dear {{name}},\n\nYour visa application ({{app_id}}) status has been updated to: {{status}}.\n\n{{details}}\n\nFor questions, contact our immigration team.", category: "Visa", active: true },
  { id: "t4", name: "Visa Status SMS", channel: "sms", body: "AtlastWave Travel and Tour: Your visa application {{app_id}} is now {{status}}. Check your dashboard for details.", category: "Visa", active: true },
  { id: "t5", name: "Shipment Tracking Update", channel: "email", subject: "Shipment Update - {{tracking_number}}", body: "Dear {{name}},\n\nYour shipment {{tracking_number}} has been updated:\n\nStatus: {{status}}\nLocation: {{location}}\nETA: {{eta}}\n\nTrack live at: {{tracking_url}}", category: "Shipment", active: true },
  { id: "t6", name: "Shipment Alert SMS", channel: "sms", body: "AtlastWave Travel and Tour: Shipment {{tracking_number}} update - {{status}}. ETA: {{eta}}", category: "Shipment", active: true },
  { id: "t7", name: "Payment Receipt", channel: "email", subject: "Payment Receipt - {{reference}}", body: "Dear {{name}},\n\nPayment received!\n\nAmount: {{amount}} {{currency}}\nReference: {{reference}}\nService: {{service}}\nMethod: {{method}}\n\nThank you!", category: "Payment", active: true },
  { id: "t8", name: "Payment Failed Alert", channel: "email", subject: "Payment Failed - Action Required", body: "Dear {{name}},\n\nYour payment of {{amount}} for {{service}} has failed.\n\nPlease retry or contact support.\n\nReference: {{reference}}", category: "Payment", active: true },
  { id: "t9", name: "Consultation Reminder", channel: "email", subject: "Consultation Reminder - {{date}}", body: "Dear {{name}},\n\nThis is a reminder for your upcoming {{type}} consultation:\n\nDate: {{date}}\nTime: {{time}}\nDuration: {{duration}} min\n\nPlease be available 5 minutes early.", category: "Consultation", active: true },
  { id: "t10", name: "Consultation Reminder SMS", channel: "sms", body: "AtlastWave Travel and Tour: Reminder - {{type}} consultation on {{date}} at {{time}}. Duration: {{duration}}min.", category: "Consultation", active: true },
  { id: "t11", name: "Work Permit Progress", channel: "email", subject: "Work Permit Update - {{programme}}", body: "Dear {{name}},\n\nYour {{programme}} application has progressed:\n\nStage: {{stage}}\nStatus: {{status}}\n\n{{notes}}\n\nOur immigration team will keep you updated.", category: "Work Permit", active: true },
];

const DEFAULT_ALERTS: AutomatedAlert[] = [
  { id: "a1", event: "booking.confirmed", description: "When a flight or hotel booking is confirmed", channel: "both", templateId: "t1", active: true },
  { id: "a2", event: "visa.status_changed", description: "When a visa application status changes", channel: "both", templateId: "t3", active: true },
  { id: "a3", event: "shipment.status_changed", description: "When a shipment status is updated", channel: "both", templateId: "t5", active: true },
  { id: "a4", event: "payment.success", description: "When a payment is successfully processed", channel: "email", templateId: "t7", active: true },
  { id: "a5", event: "payment.failed", description: "When a payment fails", channel: "email", templateId: "t8", active: true },
  { id: "a6", event: "consultation.reminder", description: "24h before a scheduled consultation", channel: "both", templateId: "t9", active: true },
  { id: "a7", event: "work_permit.stage_changed", description: "When work permit application stage changes", channel: "email", templateId: "t11", active: true },
];

const eventIcons: Record<string, any> = {
  "booking.confirmed": Plane,
  "visa.status_changed": Globe,
  "shipment.status_changed": Package,
  "payment.success": CreditCard,
  "payment.failed": CreditCard,
  "consultation.reminder": Calendar,
  "work_permit.stage_changed": Globe,
};

const AdminNotifications = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<NotificationTemplate[]>(DEFAULT_TEMPLATES);
  const [alerts, setAlerts] = useState<AutomatedAlert[]>(DEFAULT_ALERTS);
  const [activeTab, setActiveTab] = useState("templates");

  // Template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [tForm, setTForm] = useState({ name: "", channel: "email" as "email" | "sms", subject: "", body: "", category: "General", active: true });

  // Broadcast dialog
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcast, setBroadcast] = useState({ channel: "email", subject: "", body: "", audience: "all" });

  const resetTForm = () => setTForm({ name: "", channel: "email", subject: "", body: "", category: "General", active: true });

  const openCreateTemplate = () => { resetTForm(); setEditingTemplate(null); setTemplateDialogOpen(true); };
  const openEditTemplate = (t: NotificationTemplate) => {
    setEditingTemplate(t);
    setTForm({ name: t.name, channel: t.channel, subject: t.subject || "", body: t.body, category: t.category, active: t.active });
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!tForm.name.trim() || !tForm.body.trim()) {
      toast({ title: "Validation Error", description: "Name and body are required.", variant: "destructive" });
      return;
    }
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...tForm } : t));
      toast({ title: "Template Updated" });
    } else {
      const newT: NotificationTemplate = { id: `t${Date.now()}`, ...tForm };
      setTemplates(prev => [newT, ...prev]);
      toast({ title: "Template Created" });
    }
    setTemplateDialogOpen(false);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({ title: "Template Deleted" });
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleBroadcast = () => {
    if (!broadcast.body.trim()) {
      toast({ title: "Validation Error", description: "Message body is required.", variant: "destructive" });
      return;
    }
    toast({ title: "Broadcast Sent", description: `Message sent to ${broadcast.audience === "all" ? "all users" : broadcast.audience}.` });
    setBroadcastOpen(false);
    setBroadcast({ channel: "email", subject: "", body: "", audience: "all" });
  };

  const emailTemplates = templates.filter(t => t.channel === "email");
  const smsTemplates = templates.filter(t => t.channel === "sms");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Notification Management</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage templates, automated alerts, and broadcast messages.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={() => setBroadcastOpen(true)}>
              <Send className="w-4 h-4" /> Broadcast
            </Button>
            <Button size="sm" className="gap-1.5 h-9" onClick={openCreateTemplate}>
              <Plus className="w-4 h-4" /> New Template
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Email Templates", value: emailTemplates.length, icon: Mail, bg: "bg-primary/10", color: "text-primary" },
            { label: "SMS Templates", value: smsTemplates.length, icon: MessageSquare, bg: "bg-accent/15", color: "text-accent" },
            { label: "Active Alerts", value: alerts.filter(a => a.active).length, icon: Bell, bg: "bg-secondary/15", color: "text-secondary" },
            { label: "Total Alerts", value: alerts.length, icon: CheckCircle, bg: "bg-primary/10", color: "text-primary" },
          ].map(s => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="alerts">Automated Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4">
            <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
              <CardContent className="p-0">
                {templates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Inbox className="w-8 h-8 text-muted-foreground/40" /></div>
                    <p className="text-[15px] font-semibold text-foreground">No templates</p>
                    <Button className="mt-4 gap-1.5" onClick={openCreateTemplate}><Plus className="w-4 h-4" /> Create Template</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Template</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Channel</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Category</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map(t => (
                        <TableRow key={t.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div>
                              <span className="font-semibold text-[13px] text-foreground block">{t.name}</span>
                              {t.subject && <span className="text-[11px] text-muted-foreground">{t.subject}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] capitalize gap-1">
                              {t.channel === "email" ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                              {t.channel}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">{t.category}</TableCell>
                          <TableCell>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${t.active ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"}`}>
                              {t.active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditTemplate(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTemplate(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-4">
            <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Event</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Description</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Channel</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Template</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold text-right">Enabled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map(a => {
                      const Icon = eventIcons[a.event] || Bell;
                      const template = templates.find(t => t.id === a.templateId);
                      return (
                        <TableRow key={a.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
                              <span className="font-mono text-[12px] font-semibold text-foreground">{a.event}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[13px] text-muted-foreground max-w-[250px]">{a.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] capitalize">{a.channel}</Badge>
                          </TableCell>
                          <TableCell className="text-[12px] text-muted-foreground">{template?.name || "—"}</TableCell>
                          <TableCell className="text-right">
                            <Switch checked={a.active} onCheckedChange={() => toggleAlert(a.id)} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input value={tForm.name} onChange={e => setTForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Booking Confirmation" />
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={tForm.channel} onValueChange={v => setTForm(f => ({ ...f, channel: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={tForm.category} onValueChange={v => setTForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {tForm.channel === "email" && (
                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input value={tForm.subject} onChange={e => setTForm(f => ({ ...f, subject: e.target.value }))} placeholder="Email subject..." />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Body *</Label>
              <Textarea value={tForm.body} onChange={e => setTForm(f => ({ ...f, body: e.target.value }))} placeholder="Use {{variable}} for dynamic content..." rows={6} className="font-mono text-[13px]" />
              <p className="text-[11px] text-muted-foreground">Variables: {"{{name}}, {{booking_id}}, {{status}}, {{date}}, {{amount}}, {{tracking_number}}"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={tForm.active} onCheckedChange={v => setTForm(f => ({ ...f, active: v }))} />
              <Label className="text-[13px]">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveTemplate}>{editingTemplate ? "Save Changes" : "Create Template"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Broadcast Message</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={broadcast.channel} onValueChange={v => setBroadcast(b => ({ ...b, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={broadcast.audience} onValueChange={v => setBroadcast(b => ({ ...b, audience: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="active">Active Users</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {broadcast.channel === "email" && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={broadcast.subject} onChange={e => setBroadcast(b => ({ ...b, subject: e.target.value }))} placeholder="Broadcast subject..." />
              </div>
            )}
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea value={broadcast.body} onChange={e => setBroadcast(b => ({ ...b, body: e.target.value }))} placeholder="Your message..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleBroadcast} className="gap-1.5"><Send className="w-4 h-4" /> Send Broadcast</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminNotifications;
