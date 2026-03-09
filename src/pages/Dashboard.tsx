import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  LayoutDashboard, FileText, CalendarDays, Package, FolderOpen, Settings,
  User, LogOut, Upload, Edit, CheckCircle, Clock, AlertCircle, XCircle,
  Plane, ArrowRight, MessageCircle, Bell, ChevronRight, Truck, Eye,
  BookOpen, CreditCard, DollarSign, Shield, Lock, Mail, Smartphone,
  BellRing, Trash2, MapPin, Search, Plus, Download
} from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { generateReceiptPDF } from "@/lib/generateReceipt";
import { sendNotification } from "@/lib/notifications";

const sidebarItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "shipments", label: "Logistics", icon: Package },
  { id: "bookings", label: "Travel", icon: Plane },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending" },
  "in-review": { icon: AlertCircle, color: "bg-blue-100 text-blue-800 border-blue-200", label: "In Progress" },
  approved: { icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Approved" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-800 border-red-200", label: "Rejected" },
  confirmed: { icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Confirmed" },
  upcoming: { icon: Clock, color: "bg-blue-100 text-blue-800 border-blue-200", label: "Upcoming" },
  completed: { icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Completed" },
  cancelled: { icon: XCircle, color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
  "in-transit": { icon: Truck, color: "bg-blue-100 text-blue-800 border-blue-200", label: "In Transit" },
  delivered: { icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Delivered" },
};

const Dashboard = () => {
  const { user, isAuthenticated, loading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || "", phone: user?.phone || "", email: user?.email || "" });

  // Data states
  const [applications, setApplications] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAllData();
    }
  }, [isAuthenticated, user]);

  const fetchAllData = async () => {
    setDataLoading(true);
    const [appsRes, bookRes, shipRes, consRes, docsRes, payRes] = await Promise.all([
      supabase.from("applications").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("shipments").select("*").order("created_at", { ascending: false }),
      supabase.from("consultations").select("*").order("created_at", { ascending: false }),
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
    ]);
    setApplications(appsRes.data || []);
    setBookings(bookRes.data || []);
    setShipments(shipRes.data || []);
    setConsultations(consRes.data || []);
    setDocuments(docsRes.data || []);
    setPayments(payRes.data || []);
    setDataLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleSave = async () => {
    await updateProfile(form);
    setEditing(false);
    toast({ title: "Profile updated!" });
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[hsl(220,30%,15%)] text-primary-foreground fixed top-0 left-0 h-screen z-40">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="AtlasWave" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-display font-bold text-lg text-white">AtlasWave</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5 text-sm" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <header className="bg-background border-b fixed top-0 right-0 left-0 lg:left-64 z-30">
          <div className="flex items-center justify-between px-6 lg:px-8 h-16">
            <Link to="/" className="flex lg:hidden items-center gap-2">
              <img src={logo} alt="AtlasWave" className="h-8 w-8 rounded-lg object-cover" />
            </Link>
            <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 w-80">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input placeholder="Search..." className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <p className="font-display font-bold text-foreground text-sm leading-tight">{user?.fullName}</p>
                  <p className="text-muted-foreground text-[11px]">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="lg:hidden flex overflow-x-auto border-t px-4 gap-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === item.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 mt-16 lg:mt-16">
          {activeTab === "overview" && <OverviewTab applications={applications} bookings={bookings} shipments={shipments} consultations={consultations} userName={user?.fullName || "User"} greeting={greeting()} dataLoading={dataLoading} />}
          {activeTab === "applications" && <ApplicationsTab applications={applications} onRefresh={fetchAllData} userId={user?.id || ""} />}
          {activeTab === "appointments" && <AppointmentsTab consultations={consultations} onRefresh={fetchAllData} userId={user?.id || ""} />}
          {activeTab === "payments" && <PaymentsTab payments={payments} onRefresh={fetchAllData} userId={user?.id || ""} />}
          {activeTab === "invoices" && <InvoicesTab userId={user?.id || ""} />}
          {activeTab === "bookings" && <BookingsTab bookings={bookings} onRefresh={fetchAllData} userId={user?.id || ""} />}
          {activeTab === "shipments" && <ShipmentsTab shipments={shipments} />}
          {activeTab === "documents" && <DocumentsTab documents={documents} onRefresh={fetchAllData} userId={user?.id || ""} />}
          {activeTab === "settings" && (
            <SettingsTab user={user!} form={form} setForm={setForm} editing={editing} setEditing={setEditing} handleSave={handleSave} logout={logout} navigate={navigate} />
          )}
        </main>
      </div>
    </div>
  );
};

// --- OVERVIEW TAB ---
function OverviewTab({ applications, bookings, shipments, consultations, userName, greeting, dataLoading }: any) {
  const firstName = userName.split(" ")[0];
  const activeApps = applications.filter((a: any) => a.status === "pending" || a.status === "in-review").length;
  const activeShipments = shipments.filter((s: any) => s.status === "in-transit").length;
  const upcomingConsultations = consultations.filter((c: any) => c.status === "upcoming" || c.status === "confirmed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{greeting}, {firstName}</h1>
          <p className="text-muted-foreground text-sm">Here's your activity summary.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Applications", value: applications.length, active: activeApps, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
          { label: "Bookings", value: bookings.length, active: bookings.filter((b: any) => b.status === "pending").length, icon: Plane, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Shipments", value: shipments.length, active: activeShipments, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Appointments", value: consultations.length, active: upcomingConsultations, icon: CalendarDays, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-background rounded-xl border p-5">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            {s.active > 0 && <p className="text-[10px] font-semibold text-primary mt-1">{s.active} active</p>}
          </div>
        ))}
      </div>

      {/* Recent items */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-foreground">Recent Applications</h2>
          {applications.length === 0 ? (
            <div className="bg-background rounded-xl border p-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No applications yet</p>
            </div>
          ) : (
            applications.slice(0, 3).map((app: any) => {
              const cfg = statusConfig[app.status] || statusConfig.pending;
              return (
                <div key={app.id} className="bg-background rounded-xl border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{app.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{app.type} · {new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge className={cfg.color + " border text-[10px]"}>{cfg.label}</Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-foreground">Active Shipments</h2>
          {shipments.filter((s: any) => s.status === "in-transit").length === 0 ? (
            <div className="bg-background rounded-xl border p-8 text-center">
              <Truck className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active shipments</p>
            </div>
          ) : (
            shipments.filter((s: any) => s.status === "in-transit").slice(0, 3).map((s: any) => (
              <div key={s.id} className="bg-background rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground text-sm">{s.tracking_number}</p>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 border text-[10px]">In Transit</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.origin} → {s.destination}</p>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- APPLICATIONS TAB ---
function ApplicationsTab({ applications, onRefresh, userId }: { applications: any[]; onRefresh: () => void; userId: string }) {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [appForm, setAppForm] = useState({ type: "visa", title: "", details: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!appForm.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("applications").insert({
      user_id: userId,
      type: appForm.type,
      title: appForm.title,
      details: appForm.details || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await sendNotification({
      type: "application_received",
      userId,
      recipientEmail: user?.email || undefined,
      recipientPhone: user?.phone || undefined,
      recipientName: user?.fullName || undefined,
      channel: "both",
      data: {
        title: appForm.title,
        type: appForm.type,
        status: "pending",
      },
    });
    toast({ title: "Application submitted successfully!" });
    setDialogOpen(false);
    setAppForm({ type: "visa", title: "", details: "" });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Applications</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Application
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="bg-background rounded-xl border p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">No applications yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Submit a new application for visa, work permit, or travel services.</p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>New Application</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const cfg = statusConfig[app.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border bg-background hover:shadow-md transition-shadow gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                    {app.type === "work-permit" ? <FileText className="w-5 h-5 text-primary" /> :
                     app.type === "logistics" ? <Package className="w-5 h-5 text-primary" /> :
                     app.type === "travel" ? <Plane className="w-5 h-5 text-primary" /> :
                     <Eye className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{app.title}</p>
                    <p className="text-sm text-muted-foreground">{app.details || "No details"}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{app.type} · {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge className={cfg.color + " border shrink-0"}>
                  <StatusIcon className="w-3 h-3 mr-1" /> {cfg.label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}

      {/* New Application Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Submit New Application</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Application Type</Label>
              <Select value={appForm.type} onValueChange={(v) => setAppForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa Application</SelectItem>
                  <SelectItem value="work-permit">Work Permit</SelectItem>
                  <SelectItem value="travel">Travel Service</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={appForm.title} onChange={(e) => setAppForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Schengen Tourist Visa, Canada LMIA..." />
            </div>
            <div className="space-y-2">
              <Label>Details (optional)</Label>
              <Textarea value={appForm.details} onChange={(e) => setAppForm((f) => ({ ...f, details: e.target.value }))} placeholder="Add any additional details about your application..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Application"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- APPOINTMENTS TAB ---
function AppointmentsTab({ consultations, onRefresh, userId }: { consultations: any[]; onRefresh: () => void; userId: string }) {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ type: "immigration", date: "", time: "", first_name: user?.fullName?.split(" ")[0] || "", last_name: user?.fullName?.split(" ").slice(1).join(" ") || "", email: user?.email || "", phone: user?.phone || "", topic: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.date || !form.time) {
      toast({ title: "Date and time are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data: consultation, error } = await supabase.from("consultations").insert({
      user_id: userId,
      type: form.type,
      date: form.date,
      time: form.time,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      email: form.email || null,
      phone: form.phone || null,
      topic: form.topic || null,
      notes: form.notes || null,
      price: form.type === "immigration" ? 150 : form.type === "logistics" ? 100 : 75,
    }).select("status, duration").single();
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await sendNotification({
      type: "consultation_booked",
      userId,
      recipientEmail: form.email || user?.email || undefined,
      recipientPhone: form.phone || user?.phone || undefined,
      recipientName: `${form.first_name} ${form.last_name}`.trim() || user?.fullName || undefined,
      channel: "both",
      data: {
        type: form.type,
        date: form.date,
        time: form.time,
        duration: `${consultation?.duration || (form.type === "immigration" ? 60 : 45)} min`,
        status: consultation?.status || "upcoming",
      },
    });
    toast({ title: "Appointment booked successfully!" });
    setDialogOpen(false);
    setForm({ type: "immigration", date: "", time: "", first_name: user?.fullName?.split(" ")[0] || "", last_name: user?.fullName?.split(" ").slice(1).join(" ") || "", email: user?.email || "", phone: user?.phone || "", topic: "", notes: "" });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Appointments</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Book Appointment
        </Button>
      </div>

      {consultations.length === 0 ? (
        <div className="bg-background rounded-xl border p-12 text-center">
          <CalendarDays className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">No appointments yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Book a consultation with our immigration or logistics experts.</p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>Book Appointment</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c: any) => {
            const cfg = statusConfig[c.status] || statusConfig.upcoming;
            const StatusIcon = cfg.icon;
            return (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border bg-background hover:shadow-md transition-shadow gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground capitalize">{c.type} Consultation</p>
                    <p className="text-sm text-muted-foreground">{c.date} at {c.time}</p>
                    {c.topic && <p className="text-xs text-muted-foreground mt-1">Topic: {c.topic}</p>}
                    <p className="text-xs font-semibold text-foreground mt-1">${Number(c.price).toLocaleString()}</p>
                  </div>
                </div>
                <Badge className={cfg.color + " border shrink-0"}>
                  <StatusIcon className="w-3 h-3 mr-1" /> {cfg.label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Appointment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Book an Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Consultation Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immigration">Immigration Consultation ($150)</SelectItem>
                  <SelectItem value="logistics">Logistics Consultation ($100)</SelectItem>
                  <SelectItem value="travel">Travel Consultation ($75)</SelectItem>
                  <SelectItem value="general">General Consultation ($75)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="e.g. Canada Work Permit Requirements" />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any additional info..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Booking..." : "Book Appointment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- BOOKINGS TAB ---
function BookingsTab({ bookings, onRefresh, userId }: { bookings: any[]; onRefresh: () => void; userId: string }) {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ type: "flight", route: "", date: "", provider: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.route.trim() || !form.date) {
      toast({ title: "Route and date are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: userId,
      type: form.type,
      route: form.route,
      date: form.date,
      provider: form.provider || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await sendNotification({
      type: "booking_received",
      userId,
      recipientEmail: user?.email || undefined,
      recipientPhone: user?.phone || undefined,
      recipientName: user?.fullName || undefined,
      channel: "both",
      data: {
        bookingType: form.type,
        route: form.route,
        date: form.date,
        provider: form.provider || "",
        status: "pending",
      },
    });
    toast({ title: "Booking created successfully!" });
    setDialogOpen(false);
    setForm({ type: "flight", route: "", date: "", provider: "" });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Travel Bookings</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Booking
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-background rounded-xl border p-12 text-center">
          <Plane className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">No bookings yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Book flights or hotels to see them here.</p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>New Booking</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b: any) => {
            const cfg = statusConfig[b.status] || statusConfig.pending;
            return (
              <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border bg-background hover:shadow-md transition-shadow gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                    {b.type === "flight" ? <Plane className="w-5 h-5 text-primary" /> : <CalendarDays className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{b.route}</p>
                    <p className="text-sm text-muted-foreground capitalize">{b.type} · {b.provider || "TBD"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{b.date}</p>
                  </div>
                </div>
                <Badge className={cfg.color + " border shrink-0"}>{cfg.label}</Badge>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>New Travel Booking</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Booking Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="package">Travel Package</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Route / Destination</Label>
              <Input value={form.route} onChange={(e) => setForm((f) => ({ ...f, route: e.target.value }))} placeholder="e.g. Accra (ACC) → London (LHR)" />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Provider (optional)</Label>
              <Input value={form.provider} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))} placeholder="e.g. Turkish Airlines, Marriott..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Creating..." : "Create Booking"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- PAYMENTS TAB ---
function PaymentsTab({ payments, onRefresh, userId }: { payments: any[]; onRefresh: () => void; userId: string }) {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", description: "", payment_method: "card", currency: "USD" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    const reference = `PAY-${Date.now().toString(36).toUpperCase()}`;
    setSubmitting(true);
    const { error } = await supabase.from("payments").insert({
      user_id: userId,
      amount,
      currency: form.currency,
      description: form.description || null,
      payment_method: form.payment_method,
      status: "pending",
      reference,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await sendNotification({
      type: "payment_submitted",
      userId,
      recipientEmail: user?.email || undefined,
      recipientPhone: user?.phone || undefined,
      recipientName: user?.fullName || undefined,
      channel: "both",
      data: {
        amount: amount.toFixed(2),
        currency: form.currency,
        description: form.description || "Payment",
        reference,
        status: "pending",
      },
    });
    toast({ title: "Payment submitted successfully!" });
    setDialogOpen(false);
    setForm({ amount: "", description: "", payment_method: "card", currency: "USD" });
    onRefresh();
  };

  const totalPaid = payments.filter(p => p.status === "completed" || p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  const paymentStatusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending" },
    completed: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Completed" },
    paid: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Paid" },
    failed: { color: "bg-red-100 text-red-800 border-red-200", label: "Failed" },
    refunded: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Refunded" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Payments</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Make Payment
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-background rounded-xl border p-5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-foreground">${totalPaid.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Paid</p>
        </div>
        <div className="bg-background rounded-xl border p-5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-foreground">${totalPending.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="bg-background rounded-xl border p-5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{payments.length}</p>
          <p className="text-xs text-muted-foreground">Total Transactions</p>
        </div>
      </div>

      {/* Payment history */}
      {payments.length === 0 ? (
        <div className="bg-background rounded-xl border p-12 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">No payments yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Your payment history will appear here.</p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>Make Payment</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p: any) => {
            const cfg = paymentStatusConfig[p.status] || paymentStatusConfig.pending;
            return (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border bg-background hover:shadow-md transition-shadow gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{p.description || "Payment"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.reference || p.id.slice(0, 8)} · {p.payment_method || "Card"} · {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-display font-bold text-foreground text-lg">
                    {p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : p.currency === "GBP" ? "£" : p.currency === "GHS" ? "₵" : p.currency === "NGN" ? "₦" : ""}{Number(p.amount).toLocaleString()}
                  </span>
                  <Badge className={cfg.color + " border text-[10px]"}>{cfg.label}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Download Receipt"
                    onClick={() => generateReceiptPDF({
                      reference: p.reference || p.id.slice(0, 8),
                      date: new Date(p.created_at).toLocaleDateString(),
                      description: p.description || "Payment",
                      amount: Number(p.amount),
                      currency: p.currency || "USD",
                      paymentMethod: p.payment_method || "Card",
                      status: p.status,
                      customerName: user?.fullName || "Customer",
                      customerEmail: user?.email || "",
                    })}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Make Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Make a Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="GHS">GHS (₵)</SelectItem>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm((f) => ({ ...f, payment_method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="momo">Mobile Money (MoMo)</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Visa application fee, Consultation payment..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Processing..." : "Submit Payment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// --- INVOICES TAB ---
function InvoicesTab({ userId }: { userId: string }) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      setInvoices(data || []);
      setLoading(false);
    };
    fetchInvoices();
  }, [userId]);

  const invoiceStatusConfig: Record<string, { color: string; label: string }> = {
    issued: { color: "bg-amber-100 text-amber-800 border-amber-200", label: "Issued" },
    paid: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Paid" },
    refunded: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Refunded" },
    cancelled: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
  };

  const currSym = (c: string) => ({ USD: "$", EUR: "€", GBP: "£", GHS: "₵", NGN: "₦" }[c] || c + " ");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Invoices</h2>
      </div>

      {loading ? (
        <div className="bg-background rounded-xl border p-12 text-center">
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-background rounded-xl border p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">No invoices yet</h3>
          <p className="text-sm text-muted-foreground">Invoices are automatically generated when you make payments.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv: any) => {
            const cfg = invoiceStatusConfig[inv.status] || invoiceStatusConfig.issued;
            return (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border bg-background hover:shadow-md transition-shadow gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-primary text-sm">{inv.invoice_number}</p>
                    <p className="text-sm text-foreground">{inv.description || "Payment"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {inv.payment_method || "Card"} · {new Date(inv.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-display font-bold text-foreground text-lg">
                    {currSym(inv.currency)}{Number(inv.amount).toLocaleString()}
                  </span>
                  <Badge className={cfg.color + " border text-[10px]"}>{cfg.label}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Download Invoice"
                    onClick={() => generateReceiptPDF({
                      reference: inv.invoice_number,
                      date: new Date(inv.issued_at).toLocaleDateString(),
                      description: inv.description || "Payment",
                      amount: Number(inv.amount),
                      currency: inv.currency || "USD",
                      paymentMethod: inv.payment_method || "Card",
                      status: inv.status,
                      customerName: user?.fullName || "Customer",
                      customerEmail: user?.email || "",
                    })}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ShipmentsTab({ shipments }: { shipments: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Shipments</h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/logistics">Explore Logistics</Link>
        </Button>
      </div>

      {shipments.length === 0 ? (
        <div className="bg-background rounded-xl border p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">No shipments yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Your logistics and cargo shipments will appear here.</p>
          <Button size="sm" asChild><Link to="/logistics">Explore Logistics</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((s: any) => {
            const cfg = statusConfig[s.status] || statusConfig["in-transit"];
            return (
              <div key={s.id} className="p-5 rounded-xl border bg-background hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{s.tracking_number}</p>
                      <p className="text-sm text-muted-foreground">{s.origin} → {s.destination}</p>
                      {s.weight && <p className="text-xs text-muted-foreground mt-1">{s.weight}</p>}
                    </div>
                  </div>
                  <Badge className={cfg.color + " border"}>{cfg.label}</Badge>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{s.eta || `${s.progress}% complete`}</span>
                  <Link to="/tracking" className="text-sm text-primary font-medium hover:underline">Track</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- DOCUMENTS TAB ---
function DocumentsTab({ documents, onRefresh, userId }: { documents: any[]; onRefresh: () => void; userId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("user-documents").upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
    const size = file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const { error: dbError } = await supabase.from("documents").insert({
      user_id: userId,
      name: file.name,
      file_type: ext,
      file_size: size,
      file_path: filePath,
      category: "general",
    });

    setUploading(false);
    if (dbError) {
      toast({ title: "Error saving document", description: dbError.message, variant: "destructive" });
      return;
    }
    toast({ title: "Document uploaded!" });
    onRefresh();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (doc: any) => {
    if (doc.file_path) {
      await supabase.storage.from("user-documents").remove([doc.file_path]);
    }
    await supabase.from("documents").delete().eq("id", doc.id);
    toast({ title: "Document deleted" });
    onRefresh();
  };

  const handleDownload = async (doc: any) => {
    if (!doc.file_path) return;
    const { data } = await supabase.storage.from("user-documents").createSignedUrl(doc.file_path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Documents</h2>
        <div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" /> {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-background rounded-xl border p-12 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">No documents uploaded</h3>
          <p className="text-sm text-muted-foreground mb-4">Upload your passports, certificates, and other important files.</p>
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> Upload Document
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between p-4 rounded-xl border bg-background hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.file_type} · {d.file_size} · {new Date(d.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleDownload(d)}><Download className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(d)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- SETTINGS TAB ---
function SettingsTab({ user, form, setForm, editing, setEditing, handleSave, logout, navigate }: any) {
  const [settingsTab, setSettingsTab] = useState("personal");
  const [notifications, setNotifications] = useState({ email: true, desktop: true, sms: false });

  const settingsTabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: BellRing },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile, security, and preferences.</p>
      </div>

      <div className="md:hidden flex overflow-x-auto gap-2 pb-2">
        {settingsTabs.map((tab) => (
          <button key={tab.id} onClick={() => setSettingsTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap rounded-lg transition-colors ${settingsTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-muted"}`}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="hidden md:block w-48 space-y-1 shrink-0">
          {settingsTabs.map((tab) => (
            <button key={tab.id} onClick={() => setSettingsTab(tab.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${settingsTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 max-w-2xl space-y-6">
          {settingsTab === "personal" && (
            <>
              <div className="bg-background rounded-xl border p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">Profile Picture</h3>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-xl border p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-semibold text-foreground">Personal Information</h3>
                  {!editing && <button onClick={() => setEditing(true)} className="text-sm text-primary font-medium hover:underline">Edit</button>}
                </div>
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Full Name</Label>
                        <Input value={form.fullName} onChange={(e: any) => setForm((p: any) => ({ ...p, fullName: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone</Label>
                        <Input value={form.phone} onChange={(e: any) => setForm((p: any) => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Full Name</p>
                      <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                      <p className="text-sm font-medium text-foreground">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Phone</p>
                      <p className="text-sm font-medium text-foreground">{user.phone || "Not set"}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {settingsTab === "security" && (
            <div className="bg-background rounded-xl border p-6 space-y-6">
              <h3 className="font-display font-semibold text-foreground">Account Security</h3>
              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Lock className="w-5 h-5 text-muted-foreground" /></div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Password</p>
                    <p className="text-xs text-muted-foreground">Change your account password</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild><Link to="/forgot-password">Change</Link></Button>
              </div>
            </div>
          )}

          {settingsTab === "notifications" && (
            <div className="bg-background rounded-xl border p-6 space-y-6">
              <h3 className="font-display font-semibold text-foreground">Notification Preferences</h3>
              {[
                { key: "email", label: "Email Notifications", desc: "Weekly reports and progress updates" },
                { key: "desktop", label: "Desktop Alerts", desc: "Real-time push notifications" },
                { key: "sms", label: "SMS Alerts", desc: "Urgent mobile notifications" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch checked={(notifications as any)[n.key]} onCheckedChange={(v) => setNotifications((p) => ({ ...p, [n.key]: v }))} />
                </div>
              ))}
            </div>
          )}

          <div className="bg-background rounded-xl border border-destructive/30 p-6">
            <h3 className="font-display font-semibold text-destructive mb-1">Deactivate Account</h3>
            <p className="text-xs text-muted-foreground mb-4">Once you delete your account, there is no going back.</p>
            <Button variant="destructive" size="sm" onClick={() => { logout(); navigate("/"); }}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
