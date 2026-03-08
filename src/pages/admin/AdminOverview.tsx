import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign, FileText, Package, MessageSquare, Users, Plane, Globe, Briefcase,
  TrendingUp, TrendingDown, ArrowUpRight, Inbox, Clock, CreditCard,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalUsers: number;
  totalApplications: number;
  totalShipments: number;
  totalConsultations: number;
  totalPayments: number;
  totalRevenue: number;
  pendingApps: number;
  pendingPayments: number;
  activeShipments: number;
  totalBookings: number;
}

interface RecentItem {
  id: string;
  type: string;
  label: string;
  date: string;
  status: string;
}

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--destructive))"];

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, totalApplications: 0, totalShipments: 0, totalConsultations: 0,
    totalPayments: 0, totalRevenue: 0, pendingApps: 0, pendingPayments: 0,
    activeShipments: 0, totalBookings: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentItem[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        { count: userCount },
        { data: apps },
        { data: shipments },
        { count: consultationCount },
        { data: payments },
        { count: bookingCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("id, status, title, type, created_at"),
        supabase.from("shipments").select("id, status, tracking_number, destination, created_at"),
        supabase.from("consultations").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("id, amount, status, payment_method, description, created_at"),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
      ]);

      const paidPayments = (payments || []).filter(p => p.status === "paid" || p.status === "Paid");
      const totalRevenue = paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const pendingApps = (apps || []).filter(a => a.status === "pending" || a.status === "Pending").length;
      const pendingPayments = (payments || []).filter(p => p.status === "pending" || p.status === "Pending").length;
      const activeShipments = (shipments || []).filter(s => s.status === "in-transit").length;

      setStats({
        totalUsers: userCount || 0,
        totalApplications: (apps || []).length,
        totalShipments: (shipments || []).length,
        totalConsultations: consultationCount || 0,
        totalPayments: (payments || []).length,
        totalRevenue,
        pendingApps,
        pendingPayments,
        activeShipments,
        totalBookings: bookingCount || 0,
      });

      // Payment method breakdown
      const methodMap: Record<string, number> = {};
      (payments || []).forEach(p => {
        const method = p.payment_method || "Unknown";
        methodMap[method] = (methodMap[method] || 0) + Number(p.amount || 0);
      });
      setPaymentMethodData(Object.entries(methodMap).map(([name, value]) => ({ name, value })));

      // Recent activity
      const recent: RecentItem[] = [];
      (apps || []).slice(0, 3).forEach(a => recent.push({ id: a.id, type: "Application", label: a.title, date: a.created_at, status: a.status }));
      (shipments || []).slice(0, 3).forEach(s => recent.push({ id: s.id, type: "Shipment", label: `${s.tracking_number} → ${s.destination}`, date: s.created_at, status: s.status }));
      (payments || []).slice(0, 3).forEach(p => recent.push({ id: p.id, type: "Payment", label: p.description || `$${p.amount}`, date: p.created_at, status: p.status }));
      recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(recent.slice(0, 8));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "Applications", value: stats.totalApplications, icon: Globe, iconBg: "bg-accent/15", iconColor: "text-accent" },
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, iconBg: "bg-secondary/15", iconColor: "text-secondary" },
    { label: "Active Shipments", value: stats.activeShipments, icon: Package, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "Bookings", value: stats.totalBookings, icon: Plane, iconBg: "bg-accent/15", iconColor: "text-accent" },
    { label: "Consultations", value: stats.totalConsultations, icon: MessageSquare, iconBg: "bg-secondary/15", iconColor: "text-secondary" },
    { label: "Pending Apps", value: stats.pendingApps, icon: Clock, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
    { label: "Pending Payments", value: stats.pendingPayments, icon: CreditCard, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
  ];

  const quickActions = [
    { label: "View Users", path: "/admin/users", icon: Users },
    { label: "Applications", path: "/admin/applications", icon: FileText },
    { label: "Shipments", path: "/admin/shipments", icon: Package },
    { label: "Payments", path: "/admin/payments", icon: CreditCard },
    { label: "Work Permits", path: "/admin/work-permits", icon: Briefcase },
    { label: "Reports", path: "/admin/reports", icon: TrendingUp },
  ];

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved" || s === "paid" || s === "delivered") return "bg-secondary/15 text-secondary";
    if (s === "pending" || s === "upcoming") return "bg-accent/15 text-accent-foreground";
    if (s === "rejected" || s === "failed") return "bg-destructive/10 text-destructive";
    return "bg-primary/10 text-primary";
  };

  return (
    <AdminLayout>
      <div className="space-y-5 md:space-y-7">
        <div>
          <h2 className="text-lg md:text-[22px] font-sans font-bold text-foreground tracking-tight">Dashboard Overview</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Welcome back! Here's a summary of your platform.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {kpiCards.map((stat) => (
            <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-all duration-300 rounded-xl border border-border/60 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 tracking-tight">
                  {loading ? "—" : stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-5">
          {/* Payment Method Breakdown */}
          <Card className="lg:col-span-2 shadow-card rounded-xl border border-border/60">
            <CardHeader className="pt-5 px-6 pb-2">
              <CardTitle className="text-[15px] font-semibold text-foreground">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              {paymentMethodData.length === 0 ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <CreditCard className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">No payment data</p>
                  <p className="text-[12px] text-muted-foreground mt-1">Payment method breakdown will appear here.</p>
                </div>
              ) : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentMethodData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {paymentMethodData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-3 shadow-card rounded-xl border border-border/60">
            <CardHeader className="flex-row items-center justify-between pb-0 pt-5 px-6">
              <CardTitle className="text-[15px] font-semibold text-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5 pt-3">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Inbox className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-[14px] font-semibold text-foreground">No recent activity</p>
                  <p className="text-[12px] text-muted-foreground mt-1">Activity will appear here as users interact with the platform.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-foreground truncate">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.type} · {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize shrink-0 ml-2 ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card rounded-xl border border-border/60">
          <CardHeader className="pt-5 px-6 pb-3">
            <CardTitle className="text-[15px] font-semibold text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className="w-5 h-5 text-primary" />
                  <span className="text-[12px] font-semibold">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
