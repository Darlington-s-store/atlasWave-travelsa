import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, Application } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  LayoutDashboard, FileText, CalendarDays, Package, FolderOpen, Settings,
  User, LogOut, Upload, Edit, CheckCircle, Clock, AlertCircle, XCircle,
  Plane, ArrowRight, MessageCircle, Bell, ChevronRight, Truck, Eye,
  BookOpen
} from "lucide-react";
import logo from "@/assets/logo.jpeg";

// --- Sidebar ---
const sidebarItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "My Applications", icon: FileText },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "shipments", label: "Shipments", icon: Package },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

const statusConfig = {
  pending: { icon: Clock, color: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending" },
  "in-review": { icon: AlertCircle, color: "bg-blue-100 text-blue-800 border-blue-200", label: "In Progress" },
  approved: { icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Approved" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-800 border-red-200", label: "Rejected" },
};

// --- Mock data ---
const MOCK_ACTIVITIES = [
  { icon: FileText, color: "text-blue-500", title: "New document requested", desc: "Passport copy needed for Canada LMIA.", time: "2 hours ago" },
  { icon: CheckCircle, color: "text-emerald-500", title: "Payment confirmed", desc: "Logistics fees for SH-4821 received.", time: "Yesterday" },
  { icon: Plane, color: "text-amber-500", title: "Flight Alert", desc: "Gate changed for KL 590. Now Gate B12.", time: "2 days ago" },
];

const MOCK_BOOKINGS = [
  { id: "BK-001", type: "Flight", route: "Accra (ACC) → London (LHR)", date: "Mar 15, 2026", status: "confirmed" as const, airline: "British Airways • BA 078" },
  { id: "BK-002", type: "Hotel", route: "Marriott Berlin, Germany", date: "Apr 2-8, 2026", status: "confirmed" as const, airline: "6 nights • Deluxe Room" },
  { id: "BK-003", type: "Flight", route: "London (LHR) → Toronto (YYZ)", date: "Apr 10, 2026", status: "pending" as const, airline: "Air Canada • AC 849" },
];

const MOCK_SHIPMENTS = [
  { id: "SH-4821", origin: "Tema, Ghana", dest: "Rotterdam, Netherlands", weight: "240kg", status: "in-transit" as const, eta: "4 days", progress: 65 },
  { id: "SH-4798", origin: "Accra, Ghana", dest: "London, UK", weight: "120kg", status: "delivered" as const, eta: "Delivered", progress: 100 },
];

const MOCK_DOCUMENTS = [
  { name: "Passport Copy", type: "PDF", uploaded: "Feb 10, 2026", size: "2.4 MB" },
  { name: "LMIA Application Form", type: "PDF", uploaded: "Feb 15, 2026", size: "1.1 MB" },
  { name: "Degree Certificate", type: "PDF", uploaded: "Jan 20, 2026", size: "3.2 MB" },
  { name: "Employment Letter", type: "DOCX", uploaded: "Mar 01, 2026", size: "0.8 MB" },
];

const Dashboard = () => {
  const { user, isAuthenticated, logout, updateProfile, applications } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || "", phone: user?.phone || "", email: user?.email || "" });

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
    toast({ title: "Profile updated!" });
  };

  const activeApp = applications.find((a) => a.status === "in-review" || a.status === "pending");
  const activeShipment = MOCK_SHIPMENTS.find((s) => s.status === "in-transit");

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary text-primary-foreground fixed top-0 left-0 h-screen z-40">
        <div className="p-6 border-b border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="AtlasWave" className="h-9 w-9 rounded-lg object-cover" />
            <div>
              <span className="font-display font-bold text-base">AtlasWave</span>
              <p className="text-primary-foreground/50 text-xs">Travel & Logistics</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4">
          <Link to="/consultation">
            <Button variant="accent" className="w-full">
              <BookOpen className="w-4 h-4 mr-2" /> Book Consultation
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-background border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 lg:px-8 h-16">
            {/* Mobile logo */}
            <Link to="/" className="flex lg:hidden items-center gap-2">
              <img src={logo} alt="AtlasWave" className="h-8 w-8 rounded-lg object-cover" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-foreground text-sm">{user?.fullName}</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">
                    <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> VERIFIED
                  </Badge>
                  <span className="text-muted-foreground text-xs">ID: {user?.id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Upload className="w-4 h-4 mr-2" /> Upload Document
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")}>
                <Edit className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Edit Profile</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="lg:hidden flex overflow-x-auto border-t px-4 gap-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === item.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">
          {activeTab === "overview" && <OverviewTab applications={applications} activeApp={activeApp} activeShipment={activeShipment} />}
          {activeTab === "applications" && <ApplicationsTab applications={applications} />}
          {activeTab === "bookings" && <BookingsTab />}
          {activeTab === "shipments" && <ShipmentsTab />}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "settings" && (
            <SettingsTab user={user!} form={form} setForm={setForm} editing={editing} setEditing={setEditing} handleSave={handleSave} logout={logout} navigate={navigate} />
          )}
        </main>
      </div>
    </div>
  );
};

// --- OVERVIEW TAB ---
function OverviewTab({ applications, activeApp, activeShipment }: { applications: Application[]; activeApp?: Application; activeShipment?: typeof MOCK_SHIPMENTS[0] }) {
  return (
    <div className="space-y-8">
      {/* Sub tabs */}
      <div className="flex gap-6 border-b">
        {["Overview", "Applications", "Bookings", "Shipments"].map((t, i) => (
          <button key={t} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${i === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Active Processes */}
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" /> Active Processes
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Application card */}
          {activeApp && (
            <div className="bg-background rounded-xl border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge className={statusConfig[activeApp.status].color + " text-[10px] border"}>
                    {statusConfig[activeApp.status].label.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Application Status</p>
              <h3 className="font-display font-bold text-foreground mb-1">{activeApp.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{activeApp.details}</p>
              <div className="flex items-center justify-between">
                <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                  View Details <ChevronRight className="w-3 h-3" />
                </button>
                <span className="text-xs text-muted-foreground">Ref: {activeApp.id}</span>
              </div>
            </div>
          )}

          {/* Shipment card */}
          {activeShipment && (
            <div className="bg-background rounded-xl border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] border">IN TRANSIT</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Shipment</p>
              <h3 className="font-display font-bold text-foreground mb-1">GP-{activeShipment.id}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Personal Effects • {activeShipment.weight} • {activeShipment.origin} to {activeShipment.dest}
              </p>
              <div className="mb-2">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${activeShipment.progress}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Arrives in {activeShipment.eta}</span>
                <button className="text-sm text-primary font-medium hover:underline">Track</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom row: Upcoming Travel + Activity + Help */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Travel */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">Upcoming Travel</h2>
          <div className="bg-background rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-r from-primary to-primary/70 flex items-end p-5">
              <div>
                <h3 className="text-primary-foreground font-display font-bold text-lg">Flight to Toronto (YYZ)</h3>
                <p className="text-primary-foreground/70 text-sm">Air Canada • AC 849</p>
              </div>
            </div>
            <div className="p-5 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Departure</p>
                <p className="font-bold text-foreground text-sm">Mar 28, 2026</p>
                <p className="text-xs text-muted-foreground">10:30 AM (LHR)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Arrival</p>
                <p className="font-bold text-foreground text-sm">Mar 28, 2026</p>
                <p className="text-xs text-muted-foreground">01:45 PM (YYZ)</p>
              </div>
              <div className="ml-auto">
                <Button variant="outline" size="sm">Manage Booking</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Activity + Help */}
        <div className="space-y-6">
          {/* Activity */}
          <div className="bg-background rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">Activity</h3>
              <button className="text-xs text-primary font-medium hover:underline">Mark all read</button>
            </div>
            <div className="space-y-4">
              {MOCK_ACTIVITIES.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-0.5 ${a.color}`}>
                    <a.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-sm text-primary font-medium mt-4 hover:underline w-full text-center">View All Updates</button>
          </div>

          {/* Need Help */}
          <div className="bg-primary rounded-xl p-5 text-primary-foreground">
            <h3 className="font-display font-bold mb-2">Need Help?</h3>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Our dedicated relocation specialists are here to assist you with every step.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Sarah Miller</p>
                <p className="text-primary-foreground/60 text-xs">Senior Case Manager</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" /> Start Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- APPLICATIONS TAB ---
function ApplicationsTab({ applications }: { applications: Application[] }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">My Applications</h2>
      <div className="space-y-3">
        {applications.map((app) => {
          const cfg = statusConfig[app.status];
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
                  <p className="text-sm text-muted-foreground">{app.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">{app.id} · {app.date}</p>
                </div>
              </div>
              <Badge className={cfg.color + " border shrink-0"}>
                <cfg.icon className="w-3 h-3 mr-1" /> {cfg.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- BOOKINGS TAB ---
function BookingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">My Bookings</h2>
      <div className="space-y-3">
        {MOCK_BOOKINGS.map((b) => (
          <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border bg-background hover:shadow-md transition-shadow gap-3">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                {b.type === "Flight" ? <Plane className="w-5 h-5 text-primary" /> : <CalendarDays className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <p className="font-medium text-foreground">{b.route}</p>
                <p className="text-sm text-muted-foreground">{b.airline}</p>
                <p className="text-xs text-muted-foreground mt-1">{b.id} · {b.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={b.status === "confirmed" ? "bg-emerald-100 text-emerald-800 border-emerald-200 border" : "bg-amber-100 text-amber-800 border-amber-200 border"}>
                {b.status === "confirmed" ? "Confirmed" : "Pending"}
              </Badge>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SHIPMENTS TAB ---
function ShipmentsTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">My Shipments</h2>
      <div className="space-y-3">
        {MOCK_SHIPMENTS.map((s) => (
          <div key={s.id} className="p-5 rounded-xl border bg-background hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Shipment #{s.id}</p>
                  <p className="text-sm text-muted-foreground">{s.origin} → {s.dest}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.weight}</p>
                </div>
              </div>
              <Badge className={s.status === "in-transit" ? "bg-blue-100 text-blue-800 border-blue-200 border" : "bg-emerald-100 text-emerald-800 border-emerald-200 border"}>
                {s.status === "in-transit" ? "In Transit" : "Delivered"}
              </Badge>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${s.progress}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">{s.eta}</span>
              <button className="text-sm text-primary font-medium hover:underline">Track</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- DOCUMENTS TAB ---
function DocumentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Documents</h2>
        <Button size="sm"><Upload className="w-4 h-4 mr-2" /> Upload</Button>
      </div>
      <div className="space-y-3">
        {MOCK_DOCUMENTS.map((d, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-background hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.type} · {d.size} · {d.uploaded}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SETTINGS TAB ---
function SettingsTab({ user, form, setForm, editing, setEditing, handleSave, logout, navigate }: any) {
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">Account Settings</h2>
      <div className="bg-background rounded-xl border p-6 space-y-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-display font-bold text-foreground">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(e: any) => setForm((p: any) => ({ ...p, fullName: e.target.value }))} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e: any) => setForm((p: any) => ({ ...p, phone: e.target.value }))} className="h-12" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm text-foreground">{user.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm text-foreground">{user.email}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              <Button variant="destructive" size="sm" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
