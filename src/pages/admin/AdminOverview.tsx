import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign, FileText, Package, MessageSquare,
  TrendingUp, TrendingDown, CheckCircle, RefreshCw, PlusCircle, Mail,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from "recharts";

const stats = [
  { label: "Total Revenue", value: "$428,500", change: "+12.5%", trend: "up" as const, icon: DollarSign, color: "hsl(var(--accent))" },
  { label: "Active Visa Apps", value: "1,240", change: "+5.2%", trend: "up" as const, icon: FileText, color: "hsl(var(--primary))" },
  { label: "Ongoing Shipments", value: "856", change: "+8.1%", trend: "up" as const, icon: Package, color: "hsl(var(--secondary))" },
  { label: "Pending Consultations", value: "42", change: "-2.4%", trend: "down" as const, icon: MessageSquare, color: "hsl(var(--destructive))" },
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
  { name: "North America", pct: 42 },
  { name: "Europe", pct: 38 },
  { name: "Africa", pct: 15 },
  { name: "Other", pct: 5 },
];

const recentActivity = [
  { user: "John Doe", service: "F-1 Visa Application", status: "Reviewing", statusColor: "bg-accent/20 text-accent-foreground", date: "Oct 24, 2023" },
  { user: "Sarah Connor", service: "International Logistics", status: "Paid", statusColor: "bg-destructive/15 text-destructive", date: "Oct 23, 2023" },
  { user: "Marcus Aurelius", service: "H1-B Sponsorship", status: "Approved", statusColor: "bg-secondary/20 text-secondary", date: "Oct 22, 2023" },
];

const quickActions = [
  { label: "Approve Document", icon: CheckCircle },
  { label: "Update Status", icon: RefreshCw },
  { label: "New Consultation", icon: PlusCircle },
  { label: "Message Client", icon: Mail },
];

const AdminOverview = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Dashboard Overview</h2>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-shadow border-t-4" style={{ borderTopColor: stat.color }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.trend === "up" ? "bg-secondary/15 text-secondary" : "bg-destructive/15 text-destructive"}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 shadow-card">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
              <span className="text-xs text-muted-foreground">Last 7 Months</span>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", boxShadow: "var(--shadow-card)" }}
                      formatter={(value: number) => [`$${(value / 1000).toFixed(0)}k`, "Revenue"]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {revenueData.map((_, index) => (
                        <Cell key={index} fill={index === revenueData.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Shipment Destinations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-4">
                <Package className="w-16 h-16 text-primary/30" />
              </div>
              {shipmentDestinations.map((dest) => (
                <div key={dest.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{dest.name}</span>
                    <span className="text-muted-foreground font-semibold">{dest.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${dest.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Activity + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 shadow-card">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <Button variant="link" size="sm" className="text-primary p-0 h-auto">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left font-medium py-2 pr-4">USER</th>
                      <th className="text-left font-medium py-2 pr-4">SERVICE</th>
                      <th className="text-left font-medium py-2 pr-4">STATUS</th>
                      <th className="text-left font-medium py-2 pr-4">DATE</th>
                      <th className="text-right font-medium py-2">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((item, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {item.user.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{item.user}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-primary font-medium">{item.service}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{item.date}</td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs">⋮</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center group border border-transparent hover:border-primary/20"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-foreground leading-tight">{action.label}</span>
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
