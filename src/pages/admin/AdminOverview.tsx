import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign, FileText, Package, MessageSquare,
  TrendingUp, TrendingDown, CheckCircle, RefreshCw, PlusCircle, Mail,
  ArrowUpRight,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from "recharts";

const stats = [
  { label: "Total Revenue", value: "$428,500", change: "+12.5%", trend: "up" as const, icon: DollarSign, iconBg: "bg-accent/15", iconColor: "text-accent" },
  { label: "Active Visa Apps", value: "1,240", change: "+5.2%", trend: "up" as const, icon: FileText, iconBg: "bg-primary/10", iconColor: "text-primary" },
  { label: "Ongoing Shipments", value: "856", change: "+8.1%", trend: "up" as const, icon: Package, iconBg: "bg-secondary/15", iconColor: "text-secondary" },
  { label: "Pending Consultations", value: "42", change: "-2.4%", trend: "down" as const, icon: MessageSquare, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
];

const revenueData = [
  { month: "JAN", value: 18000 },
  { month: "FEB", value: 22000 },
  { month: "MAR", value: 20000 },
  { month: "APR", value: 21000 },
  { month: "MAY", value: 28000 },
  { month: "JUN", value: 32000 },
  { month: "JUL", value: 38000 },
];

const shipmentDestinations = [
  { name: "North America", pct: 42, color: "bg-primary" },
  { name: "Europe", pct: 38, color: "bg-secondary" },
  { name: "Africa", pct: 15, color: "bg-accent" },
  { name: "Other", pct: 5, color: "bg-muted-foreground" },
];

const recentActivity = [
  { user: "John Doe", service: "F-1 Visa Application", status: "Reviewing", statusColor: "bg-accent/15 text-accent-foreground border border-accent/25", date: "Oct 24, 2023" },
  { user: "Sarah Connor", service: "International Logistics", status: "Paid", statusColor: "bg-destructive/10 text-destructive border border-destructive/20", date: "Oct 23, 2023" },
  { user: "Marcus Aurelius", service: "H1-B Sponsorship", status: "Approved", statusColor: "bg-secondary/15 text-secondary border border-secondary/25", date: "Oct 22, 2023" },
];

const quickActions = [
  { label: "Approve Document", icon: CheckCircle, color: "text-secondary" },
  { label: "Update Status", icon: RefreshCw, color: "text-primary" },
  { label: "New Consultation", icon: PlusCircle, color: "text-accent" },
  { label: "Message Client", icon: Mail, color: "text-primary" },
];

const AdminOverview = () => {
  return (
    <AdminLayout>
      <div className="space-y-7">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Dashboard Overview</h2>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-all duration-300 rounded-xl border border-border/60 overflow-hidden group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-lg ${
                    stat.trend === "up"
                      ? "bg-secondary/10 text-secondary"
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-[26px] font-bold text-foreground mt-0.5 tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3 shadow-card rounded-xl border border-border/60">
            <CardHeader className="flex-row items-center justify-between pb-1 pt-5 px-6">
              <CardTitle className="text-[15px] font-semibold text-foreground">Revenue Trend</CardTitle>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">Last 7 Months</span>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} barSize={28} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `$${v / 1000}k`}
                      width={45}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 4px 16px -4px rgba(0,0,0,0.1)",
                        fontSize: 13,
                        padding: "8px 14px",
                      }}
                      formatter={(value: number) => [`$${(value / 1000).toFixed(0)}k`, "Revenue"]}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {revenueData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={index === revenueData.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-card rounded-xl border border-border/60">
            <CardHeader className="pt-5 px-6 pb-2">
              <CardTitle className="text-[15px] font-semibold text-foreground">Shipment Destinations</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="flex items-center justify-center py-6">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                  <Package className="w-10 h-10 text-muted-foreground/40" />
                </div>
              </div>
              <div className="space-y-4">
                {shipmentDestinations.map((dest) => (
                  <div key={dest.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-foreground">{dest.name}</span>
                      <span className="text-[13px] font-bold text-foreground">{dest.pct}%</span>
                    </div>
                    <div className="h-[6px] rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${dest.color} transition-all duration-500`} style={{ width: `${dest.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3 shadow-card rounded-xl border border-border/60">
            <CardHeader className="flex-row items-center justify-between pb-0 pt-5 px-6">
              <CardTitle className="text-[15px] font-semibold text-foreground">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-[12px] font-semibold h-8 px-3 hover:bg-primary/5 gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="px-6 pb-5 pt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-semibold py-2.5 pr-4 text-[11px] uppercase tracking-wider text-muted-foreground">User</th>
                      <th className="text-left font-semibold py-2.5 pr-4 text-[11px] uppercase tracking-wider text-muted-foreground">Service</th>
                      <th className="text-left font-semibold py-2.5 pr-4 text-[11px] uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="text-left font-semibold py-2.5 pr-4 text-[11px] uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="text-right font-semibold py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((item, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                              {item.user.charAt(0)}
                            </div>
                            <span className="font-semibold text-foreground">{item.user}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-primary font-medium">{item.service}</td>
                        <td className="py-3.5 pr-4">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-muted-foreground">{item.date}</td>
                        <td className="py-3.5 text-right">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">⋮</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-card rounded-xl border border-border/60">
            <CardHeader className="pt-5 px-6 pb-3">
              <CardTitle className="text-[15px] font-semibold text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-2.5 p-5 rounded-xl bg-background hover:bg-muted/50 transition-all duration-200 text-center group border border-border/50 hover:border-border hover:shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-xl bg-muted/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="text-[12px] font-semibold text-foreground leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
