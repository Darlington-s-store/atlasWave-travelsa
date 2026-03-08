import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Plane, Package, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

const stats = [
  { label: "Total Users", value: "1,284", change: "+12%", trend: "up", icon: Users },
  { label: "Applications", value: "342", change: "+8%", trend: "up", icon: FileText },
  { label: "Travel Bookings", value: "89", change: "-3%", trend: "down", icon: Plane },
  { label: "Shipments", value: "156", change: "+24%", trend: "up", icon: Package },
];

const recentActivity = [
  { user: "Kwame Asante", action: "Submitted work permit application", time: "2 min ago", type: "application" },
  { user: "Ama Mensah", action: "Booked flight to Frankfurt", time: "15 min ago", type: "booking" },
  { user: "Kofi Boateng", action: "Registered new account", time: "1 hour ago", type: "user" },
  { user: "Yaa Serwaa", action: "Updated shipment tracking", time: "2 hours ago", type: "shipment" },
  { user: "Daniel Ofori", action: "Completed credential evaluation", time: "3 hours ago", type: "application" },
];

const AdminOverview = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">Monitor key metrics and recent activity across the platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-secondary" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === "up" ? "text-secondary" : "text-destructive"}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart Placeholder */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center rounded-lg bg-muted/50 border border-border border-dashed">
                <div className="text-center">
                  <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Revenue chart will render here</p>
                  <p className="text-xs text-muted-foreground mt-1">Connect to a backend to display live data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Review Pending Applications", count: 12 },
                { label: "Approve User Registrations", count: 5 },
                { label: "Update Service Listings", count: 0 },
                { label: "Respond to Inquiries", count: 8 },
              ].map((action) => (
                <button key={action.label} className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left group">
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                  <div className="flex items-center gap-2">
                    {action.count > 0 && (
                      <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        {action.count}
                      </span>
                    )}
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{item.user.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.user}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOverview;
