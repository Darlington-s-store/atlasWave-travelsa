import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, Application } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  LayoutDashboard, FileText, CalendarDays, Package, FolderOpen, Settings,
  User, LogOut, Upload, Edit, CheckCircle, Clock, AlertCircle, XCircle,
  Plane, ArrowRight, MessageCircle, Bell, ChevronRight, Truck, Eye,
  BookOpen, CreditCard, DollarSign, Shield, Lock, Mail, Smartphone,
  BellRing, Trash2, MapPin, Search
} from "lucide-react";
import logo from "@/assets/logo.jpeg";

// --- Sidebar ---
const sidebarItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "shipments", label: "Logistics", icon: Package },
  { id: "bookings", label: "Travel", icon: Plane },
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
const MOCK_ACTIVITIES: { icon: any; color: string; bg: string; title: string; desc: string; time: string }[] = [];

const MOCK_BOOKINGS: { id: string; type: string; route: string; date: string; status: "confirmed" | "pending"; airline: string }[] = [];

const MOCK_SHIPMENTS: { id: string; origin: string; dest: string; weight: string; status: "in-transit" | "delivered"; eta: string; progress: number }[] = [];

const MOCK_DOCUMENTS: { name: string; type: string; uploaded: string; size: string }[] = [];

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
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout + Support */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5 text-sm"
            onClick={() => { logout(); navigate("/"); }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
          <div className="pt-2 border-t border-white/10">
            <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-2">Support Hours</p>
            <p className="text-white/60 text-xs mb-3">Mon-Fri 9am - 6pm EST</p>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
              <MessageCircle className="w-4 h-4 mr-2" /> Start Live Chat
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Top bar */}
        <header className="bg-background border-b fixed top-0 right-0 left-0 lg:left-64 z-30">
          <div className="flex items-center justify-between px-6 lg:px-8 h-16">
            {/* Mobile logo */}
            <Link to="/" className="flex lg:hidden items-center gap-2">
              <img src={logo} alt="AtlasWave" className="h-8 w-8 rounded-lg object-cover" />
            </Link>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 w-80">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search applications, flights, or documents..."
                className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <p className="font-display font-bold text-foreground text-sm leading-tight">{user?.fullName}</p>
                  <p className="text-muted-foreground text-[11px]">Premium Member</p>
                </div>
              </div>
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
        <main className="flex-1 p-6 lg:p-8 mt-16 lg:mt-16">
          {activeTab === "overview" && <OverviewTab applications={applications} activeApp={activeApp} activeShipment={activeShipment} userName={user?.fullName || "User"} greeting={greeting()} />}
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
function OverviewTab({ applications, activeApp, activeShipment, userName, greeting }: { applications: Application[]; activeApp?: Application; activeShipment?: typeof MOCK_SHIPMENTS[0]; userName: string; greeting: string }) {
  const firstName = userName.split(" ")[0];
  const barData = [40, 55, 35, 70, 60, 80, 45];
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{greeting}, {firstName}</h1>
          <p className="text-muted-foreground text-sm">Here's what's happening with your global mobility profile today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Download Reports</Button>
          <Button size="sm">New Application</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Visa Progress */}
        <div className="bg-background rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground text-sm">Visa Progress</h3>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] border">Canada LMIA</Badge>
          </div>
          <div className="flex items-center justify-center mb-3">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="10" className="stroke-muted" />
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="10" className="stroke-primary" strokeDasharray={`${70 * 2.51} ${100 * 2.51}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-2xl text-foreground">70%</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Complete</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">Next step: <span className="font-medium text-foreground">Biometrics Appointment</span></p>
        </div>

        {/* Spending by Category */}
        <div className="bg-background rounded-xl border p-6">
          <h3 className="font-display font-semibold text-foreground text-sm mb-4">Spending by Category</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="12" className="stroke-[hsl(220,70%,50%)]" strokeDasharray={`${45 * 2.51} ${100 * 2.51}`} />
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="12" className="stroke-primary" strokeDasharray={`${35 * 2.51} ${100 * 2.51}`} strokeDashoffset={`-${45 * 2.51}`} />
                <circle cx="50" cy="50" r="40" fill="none" strokeWidth="12" className="stroke-amber-400" strokeDasharray={`${20 * 2.51} ${100 * 2.51}`} strokeDashoffset={`-${80 * 2.51}`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-sm text-foreground">$3.4k</span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[hsl(220,70%,50%)]" /> Visas <span className="text-muted-foreground ml-auto">45%</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Logistics <span className="text-muted-foreground ml-auto">35%</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Travel <span className="text-muted-foreground ml-auto">20%</span></div>
            </div>
          </div>
        </div>

        {/* Activity Volume */}
        <div className="bg-background rounded-xl border p-6">
          <h3 className="font-display font-semibold text-foreground text-sm mb-4">Activity Volume</h3>
          <div className="flex items-end gap-2 h-20">
            {barData.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all ${i === 5 ? "bg-primary" : "bg-primary/30"}`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Processes + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">Active Processes</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Application card */}
            {activeApp && (
              <div className="bg-background rounded-xl border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] border">IMMIGRATION</Badge>
                </div>
                <h3 className="font-display font-bold text-foreground mb-0.5">{activeApp.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">Application ID: #{activeApp.id}</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Verification Stage</span>
                  <span className="text-xs font-semibold text-foreground">85%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-primary rounded-full" style={{ width: "85%" }} />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> Estimated completion: Oct 24
                </div>
              </div>
            )}

            {/* Shipment card */}
            {activeShipment && (
              <div className="bg-background rounded-xl border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] border">IN TRANSIT</Badge>
                </div>
                <h3 className="font-display font-bold text-foreground mb-0.5">Household Relocation</h3>
                <p className="text-xs text-muted-foreground mb-2">Tracking: MY-{activeShipment.id}</p>
                <div className="flex items-center gap-1 text-xs text-foreground mb-1">
                  <Truck className="w-3 h-3 text-primary" /> En Route to Port
                  <span className="ml-auto font-semibold">{activeShipment.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${activeShipment.progress}%` }} />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> Current: Jersey City Terminal
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Flight Card */}
          <div className="bg-[hsl(220,30%,15%)] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-5">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Upcoming Flight</p>
                <p className="font-display font-bold text-xl mt-1">JFK → BER</p>
              </div>
              <div className="h-10 w-px bg-white/20 hidden sm:block" />
              <div>
                <p className="text-[10px] text-white/50 uppercase">Date</p>
                <p className="font-semibold text-sm">Nov 12, 2024</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase">Gate</p>
                <p className="font-semibold text-sm">B32</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] text-white/50 uppercase">Booking Ref</p>
                <p className="font-semibold text-sm">LX-9921</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 hover:text-white shrink-0">
              View Ticket
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">Recent Activity</h2>
          <div className="bg-background rounded-xl border p-5">
            <div className="space-y-5">
              {MOCK_ACTIVITIES.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center shrink-0`}>
                    <a.icon className={`w-4 h-4 ${a.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-sm text-primary font-semibold mt-5 hover:underline w-full text-center uppercase tracking-wider text-xs">
              View Full History
            </button>
          </div>

          {/* Need Professional Help */}
          <div className="bg-background rounded-xl border p-5">
            <h3 className="font-display font-bold text-foreground mb-2">Need Professional Help?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Our immigration experts are ready to assist you with complex visa requirements and relocation logistics.
            </p>
            <Button className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" /> Start Priority Chat
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
      {applications.length === 0 ? (
        <div className="bg-background rounded-xl border p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">No applications yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Start a new application to track your immigration or travel services.</p>
          <Button size="sm">New Application</Button>
        </div>
      ) : (
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
      )}
    </div>
  );
}

// --- BOOKINGS TAB ---
function BookingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">My Bookings</h2>
      {MOCK_BOOKINGS.length === 0 ? (
        <div className="bg-background rounded-xl border p-12 text-center">
          <Plane className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-foreground mb-1">No bookings yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Book flights or hotels to see them here.</p>
          <Button size="sm" asChild><Link to="/travel">Browse Travel Services</Link></Button>
        </div>
      ) : (
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
      )}
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
  const [settingsTab, setSettingsTab] = useState("personal");
  const [notifications, setNotifications] = useState({ email: true, desktop: true, sms: false });

  const settingsTabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: BellRing },
    { id: "preferences", label: "Preferences", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile, security, and communication preferences.</p>
      </div>

      {/* Mobile settings tabs */}
      <div className="md:hidden flex overflow-x-auto gap-2 pb-2">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSettingsTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap rounded-lg transition-colors ${
              settingsTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-muted"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Settings sidebar */}
        <div className="hidden md:block w-48 space-y-1 shrink-0">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                settingsTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings content */}
        <div className="flex-1 max-w-2xl space-y-6">
          {settingsTab === "personal" && (
            <>
              {/* Profile Picture */}
              <div className="bg-background rounded-xl border p-6">
                <h3 className="font-display font-semibold text-foreground mb-4 text-primary">Profile Picture</h3>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center relative">
                    <User className="w-10 h-10 text-muted-foreground" />
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                      <Edit className="w-3.5 h-3.5 text-primary-foreground" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground mb-2">JPG, GIF or PNG. Max size of 800K</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="text-xs">Upload New Photo</Button>
                      <Button variant="outline" size="sm" className="text-xs">Remove</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-background rounded-xl border p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-semibold text-foreground text-primary">Personal Information</h3>
                  {!editing && (
                    <button onClick={() => setEditing(true)} className="text-sm text-primary font-medium hover:underline">Edit All</button>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Full Name</Label>
                        <Input value={form.fullName} onChange={(e: any) => setForm((p: any) => ({ ...p, fullName: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Email Address</Label>
                        <Input value={form.email} onChange={(e: any) => setForm((p: any) => ({ ...p, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone Number</Label>
                        <Input value={form.phone} onChange={(e: any) => setForm((p: any) => ({ ...p, phone: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Location</Label>
                        <Input placeholder="City, Country" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Bio</Label>
                      <Input placeholder="Tell us about yourself..." />
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
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Email Address</p>
                      <p className="text-sm font-medium text-foreground">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Phone Number</p>
                      <p className="text-sm font-medium text-foreground">{user.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Location</p>
                      <p className="text-sm font-medium text-foreground">San Francisco, California, USA</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Bio</p>
                      <p className="text-sm text-foreground">Product Designer specialized in logistics and global mapping systems at AtlasWave</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {settingsTab === "security" && (
            <div className="bg-background rounded-xl border p-6 space-y-6">
              <h3 className="font-display font-semibold text-foreground text-primary">Account Security</h3>

              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Password</p>
                    <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          )}

          {settingsTab === "notifications" && (
            <div className="bg-background rounded-xl border p-6 space-y-6">
              <h3 className="font-display font-semibold text-foreground text-primary">Notification Preferences</h3>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm text-primary">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Weekly reports, progress updates, and team alerts</p>
                  </div>
                  <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications(p => ({ ...p, email: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm text-primary">Desktop Alerts</p>
                    <p className="text-xs text-muted-foreground">Real-time push notifications for reminders</p>
                  </div>
                  <Switch checked={notifications.desktop} onCheckedChange={(v) => setNotifications(p => ({ ...p, desktop: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm text-primary">SMS Alerts</p>
                    <p className="text-xs text-muted-foreground">Urgent mobile phone notifications</p>
                  </div>
                  <Switch checked={notifications.sms} onCheckedChange={(v) => setNotifications(p => ({ ...p, sms: v }))} />
                </div>
              </div>

              <Button className="w-full sm:w-auto">Save All Changes</Button>
            </div>
          )}

          {settingsTab === "preferences" && (
            <div className="bg-background rounded-xl border p-6 space-y-6">
              <h3 className="font-display font-semibold text-foreground text-primary">Preferences</h3>
              <p className="text-sm text-muted-foreground">Language, timezone, and display preferences coming soon.</p>
            </div>
          )}

          {/* Deactivate Account - always visible */}
          <div className="bg-background rounded-xl border border-destructive/30 p-6">
            <h3 className="font-display font-semibold text-destructive mb-1">Deactivate Account</h3>
            <p className="text-xs text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
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
