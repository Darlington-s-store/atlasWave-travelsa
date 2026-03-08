import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign, FileText, Package, MessageSquare,
  TrendingUp, TrendingDown, ArrowUpRight, Inbox,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const stats = [
  { label: "Total Revenue", value: "$0", change: "0%", trend: "up" as const, icon: DollarSign, iconBg: "bg-accent/15", iconColor: "text-accent" },
  { label: "Active Visa Apps", value: "0", change: "0%", trend: "up" as const, icon: FileText, iconBg: "bg-primary/10", iconColor: "text-primary" },
  { label: "Ongoing Shipments", value: "0", change: "0%", trend: "up" as const, icon: Package, iconBg: "bg-secondary/15", iconColor: "text-secondary" },
  { label: "Pending Consultations", value: "0", change: "0%", trend: "down" as const, icon: MessageSquare, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
];

const AdminOverview = () => {
  return (
    <AdminLayout>
      <div className="space-y-5 md:space-y-7">
        <div>
          <h2 className="text-lg md:text-[22px] font-sans font-bold text-foreground tracking-tight">Dashboard Overview</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Welcome back! Here's a summary of your platform.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5">
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-all duration-300 rounded-xl border border-border/60 overflow-hidden group">
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between mb-2 sm:mb-4">
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
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
              <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">No data yet</span>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="h-[260px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-[14px] font-semibold text-foreground">No revenue data</p>
                <p className="text-[12px] text-muted-foreground mt-1 max-w-[240px]">Revenue trends will appear here once payments start coming in.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-card rounded-xl border border-border/60">
            <CardHeader className="pt-5 px-6 pb-2">
              <CardTitle className="text-[15px] font-semibold text-foreground">Shipment Destinations</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="h-[260px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-[14px] font-semibold text-foreground">No shipments yet</p>
                <p className="text-[12px] text-muted-foreground mt-1 max-w-[240px]">Shipment destination breakdown will show here once logistics data is available.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3 shadow-card rounded-xl border border-border/60">
            <CardHeader className="flex-row items-center justify-between pb-0 pt-5 px-6">
              <CardTitle className="text-[15px] font-semibold text-foreground">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary text-[12px] font-semibold h-8 px-3 hover:bg-primary/5 gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="px-6 pb-5 pt-3">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Inbox className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-[14px] font-semibold text-foreground">No recent activity</p>
                <p className="text-[12px] text-muted-foreground mt-1">Activity will appear here as users interact with the platform.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-card rounded-xl border border-border/60">
            <CardHeader className="pt-5 px-6 pb-3">
              <CardTitle className="text-[15px] font-semibold text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[13px] text-muted-foreground">Quick actions will be available once your platform has active data.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
