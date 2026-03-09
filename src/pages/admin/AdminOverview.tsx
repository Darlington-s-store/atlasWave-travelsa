import { useEffect, useState } from "react";
import { CreditCard, DollarSign, Globe, Inbox, MessageSquare, Package, Plane, TrendingUp, Users, Clock, Briefcase } from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

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
    totalUsers: 0,
    totalApplications: 0,
    totalShipments: 0,
    totalConsultations: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pendingApps: 0,
    pendingPayments: 0,
    activeShipments: 0,
    totalBookings: 0,
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
          supabase.from("payments").select("id, amount, status, payment_method, description, created_at"),
          supabase.from("bookings").select("*", { count: "exact", head: true }),
        ]);

        const paidPayments = (payments || []).filter((payment) => payment.status === "paid" || payment.status === "Paid");
        const totalRevenue = paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const pendingApps = (apps || []).filter((app) => app.status === "pending" || app.status === "Pending").length;
        const pendingPayments = (payments || []).filter((payment) => payment.status === "pending" || payment.status === "Pending").length;
        const activeShipments = (shipments || []).filter((shipment) => shipment.status === "in-transit").length;

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

        const methodMap: Record<string, number> = {};
        (payments || []).forEach((payment) => {
          const method = payment.payment_method || "Unknown";
          methodMap[method] = (methodMap[method] || 0) + Number(payment.amount || 0);
        });
        setPaymentMethodData(Object.entries(methodMap).map(([name, value]) => ({ name, value })));

        const recent: RecentItem[] = [];
        (apps || []).slice(0, 3).forEach((app) =>
          recent.push({ id: app.id, type: "Application", label: app.title, date: app.created_at, status: app.status }),
        );
        (shipments || []).slice(0, 3).forEach((shipment) =>
          recent.push({
            id: shipment.id,
            type: "Shipment",
            label: `${shipment.tracking_number} -> ${shipment.destination}`,
            date: shipment.created_at,
            status: shipment.status,
          }),
        );
        (payments || []).slice(0, 3).forEach((payment) =>
          recent.push({
            id: payment.id,
            type: "Payment",
            label: payment.description || `$${payment.amount}`,
            date: payment.created_at,
            status: payment.status,
          }),
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
    { label: "Applications", path: "/admin/applications", icon: Globe },
    { label: "Shipments", path: "/admin/shipments", icon: Package },
    { label: "Payments", path: "/admin/payments", icon: CreditCard },
    { label: "Work Permits", path: "/admin/work-permits", icon: Briefcase },
    { label: "Reports", path: "/admin/reports", icon: TrendingUp },
  ];

  const statusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === "approved" || normalized === "paid" || normalized === "delivered") {
      return "bg-secondary/15 text-secondary";
    }
    if (normalized === "pending" || normalized === "upcoming") {
      return "bg-accent/15 text-accent-foreground";
    }
    if (normalized === "rejected" || normalized === "failed") {
      return "bg-destructive/10 text-destructive";
    }
    return "bg-primary/10 text-primary";
  };

  return (
    <AdminLayout>
      <div className="space-y-5 md:space-y-7">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground md:text-[22px]">Dashboard Overview</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Welcome back! Here is a summary of your platform.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {kpiCards.map((stat) => (
            <Card
              key={stat.label}
              className="overflow-hidden rounded-xl border border-border/60 shadow-card transition-all duration-300 hover:shadow-card-hover"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="mb-2 flex items-start justify-between sm:mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${stat.iconBg}`}>
                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:text-[11px]">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {loading ? "-" : stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-5 lg:grid-cols-5">
          <Card className="rounded-xl border border-border/60 shadow-card lg:col-span-2">
            <CardHeader className="px-6 pb-2 pt-5">
              <CardTitle className="text-[15px] font-semibold text-foreground">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-5 sm:px-6">
              {paymentMethodData.length === 0 ? (
                <div className="flex h-[220px] flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <CreditCard className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">No payment data</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">Payment method breakdown will appear here.</p>
                </div>
              ) : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        outerRadius={isMobile ? 56 : 80}
                        dataKey="value"
                        label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentMethodData.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border/60 shadow-card lg:col-span-3">
            <CardHeader className="flex-row items-center justify-between px-6 pb-0 pt-5">
              <CardTitle className="text-[15px] font-semibold text-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-5 pt-3 sm:px-6">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <Inbox className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-[14px] font-semibold text-foreground">No recent activity</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Activity will appear here as users interact with the platform.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.type} · {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`self-start rounded-md px-2 py-0.5 text-[10px] font-bold capitalize sm:self-auto ${statusBadge(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl border border-border/60 shadow-card">
          <CardHeader className="px-6 pb-3 pt-5">
            <CardTitle className="text-[15px] font-semibold text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="flex h-auto flex-col items-center gap-2 rounded-xl py-4 transition-all hover:border-primary/30 hover:bg-primary/5"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className="h-5 w-5 text-primary" />
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
