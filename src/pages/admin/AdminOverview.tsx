import { useEffect, useState } from "react";
import { CreditCard, DollarSign, Globe, Inbox, Package, Plane, Users, Clock, ArrowRight } from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/lib/currency";

interface DashboardStats {
  totalUsers: number;
  totalApplications: number;
  totalShipments: number;
  totalConsultations: number;
  totalPayments: number;
  totalRevenue: number;
  pendingApps: number;
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

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
];

const AdminOverview = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, totalApplications: 0, totalShipments: 0,
    totalConsultations: 0, totalPayments: 0, totalRevenue: 0,
    pendingApps: 0, activeShipments: 0, totalBookings: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentItem[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          supabase.from("payments").select("id, amount, status, payment_method, description, created_at, currency"),
          supabase.from("bookings").select("*", { count: "exact", head: true }),
        ]);

        const completedPayments = (payments || []).filter((p) => p.status === "completed" || p.status === "paid");
        const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const pendingApps = (apps || []).filter((a) => a.status === "pending").length;
        const activeShipments = (shipments || []).filter((s) => s.status === "in-transit").length;

        setStats({
          totalUsers: userCount || 0,
          totalApplications: (apps || []).length,
          totalShipments: (shipments || []).length,
          totalConsultations: consultationCount || 0,
          totalPayments: (payments || []).length,
          totalRevenue,
          pendingApps,
          activeShipments,
          totalBookings: bookingCount || 0,
        });

        const methodMap: Record<string, number> = {};
        (payments || []).forEach((p) => {
          const method = p.payment_method || "Other";
          methodMap[method] = (methodMap[method] || 0) + Number(p.amount || 0);
        });
        setPaymentMethodData(Object.entries(methodMap).map(([name, value]) => ({ name, value })));

        const recent: RecentItem[] = [];
        (apps || []).slice(0, 4).forEach((a) =>
          recent.push({ id: a.id, type: "Application", label: a.title, date: a.created_at, status: a.status })
        );
        (shipments || []).slice(0, 3).forEach((s) =>
          recent.push({ id: s.id, type: "Shipment", label: `${s.tracking_number} → ${s.destination}`, date: s.created_at, status: s.status })
        );
        (payments || []).slice(0, 3).forEach((p) =>
          recent.push({ id: p.id, type: "Payment", label: p.description || formatCurrency(p.amount, p.currency || "GHS"), date: p.created_at, status: p.status })
        );
        recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentActivity(recent.slice(0, 8));
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchDashboardData();
  }, []);

  const kpiCards = [
    { label: "Users", value: stats.totalUsers, icon: Users, bg: "bg-primary/10", color: "text-primary" },
    { label: "Applications", value: stats.totalApplications, icon: Globe, bg: "bg-accent/15", color: "text-accent-foreground" },
    { label: "Revenue", value: formatCurrency(stats.totalRevenue, "GHS"), icon: DollarSign, bg: "bg-secondary/15", color: "text-secondary" },
    { label: "Shipments", value: stats.activeShipments, sub: `${stats.totalShipments} total`, icon: Package, bg: "bg-primary/10", color: "text-primary" },
    { label: "Bookings", value: stats.totalBookings, icon: Plane, bg: "bg-accent/15", color: "text-accent-foreground" },
    { label: "Pending Apps", value: stats.pendingApps, icon: Clock, bg: "bg-destructive/10", color: "text-destructive" },
  ];

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (["approved", "paid", "completed", "delivered"].includes(s)) return "bg-secondary/15 text-secondary";
    if (["pending", "upcoming"].includes(s)) return "bg-accent/15 text-accent-foreground";
    if (["rejected", "failed"].includes(s)) return "bg-destructive/10 text-destructive";
    return "bg-primary/10 text-primary";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Platform overview and recent activity.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {kpiCards.map((stat) => (
            <Card key={stat.label} className="rounded-xl border shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground mt-0.5">{loading ? "–" : stat.value}</p>
                {"sub" in stat && stat.sub && <p className="text-[10px] text-muted-foreground">{stat.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts & Activity */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <Card className="rounded-xl lg:col-span-2">
            <CardHeader className="px-5 pb-2 pt-5">
              <CardTitle className="text-sm font-semibold">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {paymentMethodData.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <CreditCard className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No payment data yet</p>
                </div>
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentMethodData} cx="50%" cy="50%" outerRadius={isMobile ? 54 : 76} dataKey="value"
                        label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {paymentMethodData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v, "GHS")} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl lg:col-span-3">
            <CardHeader className="px-5 pb-0 pt-5 flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-3">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Inbox className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">{item.type} · {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`ml-3 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${statusBadge(item.status)}`}>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Users", path: "/admin/users", icon: Users },
            { label: "Applications", path: "/admin/applications", icon: Globe },
            { label: "Shipments", path: "/admin/shipments", icon: Package },
            { label: "Payments", path: "/admin/payments", icon: CreditCard },
            { label: "Consultations", path: "/admin/consultations", icon: Clock },
            { label: "Flights", path: "/admin/flights", icon: Plane },
          ].map((a) => (
            <Button key={a.label} variant="outline" className="flex h-auto flex-col items-center gap-2 rounded-xl py-4 hover:border-primary/30 hover:bg-primary/5"
              onClick={() => navigate(a.path)}>
              <a.icon className="w-5 h-5 text-primary" />
              <span className="text-[11px] font-semibold">{a.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
