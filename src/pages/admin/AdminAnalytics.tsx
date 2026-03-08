import { useState, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from "recharts";
import {
  Download, DollarSign, Package, FileText, Users, TrendingUp,
  Plane, Hotel, Briefcase, Ship, Calendar,
} from "lucide-react";

// Mock data
const revenueByMonth = [
  { month: "Jan", revenue: 12400, expenses: 8200 },
  { month: "Feb", revenue: 15800, expenses: 9100 },
  { month: "Mar", revenue: 18200, expenses: 10400 },
  { month: "Apr", revenue: 14600, expenses: 8700 },
  { month: "May", revenue: 21300, expenses: 11200 },
  { month: "Jun", revenue: 24500, expenses: 12800 },
  { month: "Jul", revenue: 22100, expenses: 11900 },
  { month: "Aug", revenue: 26800, expenses: 13400 },
  { month: "Sep", revenue: 23400, expenses: 12100 },
  { month: "Oct", revenue: 28900, expenses: 14600 },
  { month: "Nov", revenue: 31200, expenses: 15800 },
  { month: "Dec", revenue: 35400, expenses: 17200 },
];

const revenueByService = [
  { name: "Flight Bookings", value: 42500, color: "hsl(204, 81%, 21%)" },
  { name: "Visa Processing", value: 35200, color: "hsl(168, 76%, 42%)" },
  { name: "Work Permits", value: 28800, color: "hsl(44, 100%, 48%)" },
  { name: "Logistics", value: 22400, color: "hsl(0, 84%, 60%)" },
  { name: "Hotels", value: 18600, color: "hsl(210, 29%, 24%)" },
  { name: "Consultations", value: 12300, color: "hsl(210, 15%, 46%)" },
];

const shipmentsByDestination = [
  { destination: "UK", count: 45, onTime: 42 },
  { destination: "Canada", count: 38, onTime: 35 },
  { destination: "Germany", count: 32, onTime: 30 },
  { destination: "USA", count: 28, onTime: 25 },
  { destination: "France", count: 22, onTime: 20 },
  { destination: "Netherlands", count: 18, onTime: 17 },
];

const applicationsByProgram = [
  { program: "Schengen Work Permit", pending: 24, approved: 45, rejected: 8 },
  { program: "Canada LMIA", pending: 18, approved: 32, rejected: 5 },
  { program: "Germany Chancenkarte", pending: 15, approved: 28, rejected: 3 },
  { program: "USA NCLEX", pending: 12, approved: 22, rejected: 4 },
  { program: "Credential Eval", pending: 8, approved: 38, rejected: 2 },
];

const weeklyTrend = [
  { week: "W1", users: 120, bookings: 45, applications: 18 },
  { week: "W2", users: 145, bookings: 52, applications: 22 },
  { week: "W3", users: 132, bookings: 48, applications: 20 },
  { week: "W4", users: 168, bookings: 61, applications: 28 },
  { week: "W5", users: 155, bookings: 58, applications: 25 },
  { week: "W6", users: 182, bookings: 67, applications: 31 },
  { week: "W7", users: 198, bookings: 72, applications: 35 },
  { week: "W8", users: 210, bookings: 78, applications: 38 },
];

const paymentMethods = [
  { name: "Mastercard", value: 62, color: "hsl(204, 81%, 21%)" },
  { name: "Mobile Money", value: 38, color: "hsl(44, 100%, 48%)" },
];

const AdminAnalytics = () => {
  const [period, setPeriod] = useState("yearly");
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content = reportRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analytics Report — African Waves</title>
          <style>
            body { font-family: 'DM Sans', Arial, sans-serif; padding: 40px; color: #2C3E50; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            h2 { font-size: 18px; margin-top: 32px; margin-bottom: 16px; color: #0A3D62; }
            .report-header { border-bottom: 2px solid #0A3D62; padding-bottom: 16px; margin-bottom: 24px; }
            .report-date { font-size: 13px; color: #6B7280; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
            .stat-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; }
            .stat-label { font-size: 11px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
            .stat-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #E5E7EB; font-size: 13px; }
            th { background: #F9FAFB; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; color: #6B7280; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>📊 Analytics Report</h1>
            <p class="report-date">African Waves Logistics & Immigration — Generated: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card"><p class="stat-label">Total Revenue</p><p class="stat-value">$274,600</p></div>
            <div class="stat-card"><p class="stat-label">Total Shipments</p><p class="stat-value">183</p></div>
            <div class="stat-card"><p class="stat-label">Applications</p><p class="stat-value">284</p></div>
            <div class="stat-card"><p class="stat-label">Active Users</p><p class="stat-value">1,210</p></div>
          </div>

          <h2>Revenue by Service</h2>
          <table>
            <thead><tr><th>Service</th><th class="text-right">Revenue</th><th class="text-right">Share</th></tr></thead>
            <tbody>
              ${revenueByService.map(s => `<tr><td>${s.name}</td><td class="text-right font-bold">$${s.value.toLocaleString()}</td><td class="text-right">${Math.round(s.value / 1598 * 10) / 10}%</td></tr>`).join("")}
            </tbody>
          </table>

          <h2>Shipments by Destination</h2>
          <table>
            <thead><tr><th>Destination</th><th class="text-right">Total</th><th class="text-right">On-Time</th><th class="text-right">Rate</th></tr></thead>
            <tbody>
              ${shipmentsByDestination.map(s => `<tr><td>${s.destination}</td><td class="text-right">${s.count}</td><td class="text-right">${s.onTime}</td><td class="text-right">${Math.round(s.onTime / s.count * 100)}%</td></tr>`).join("")}
            </tbody>
          </table>

          <h2>Applications by Program</h2>
          <table>
            <thead><tr><th>Program</th><th class="text-right">Pending</th><th class="text-right">Approved</th><th class="text-right">Rejected</th><th class="text-right">Total</th></tr></thead>
            <tbody>
              ${applicationsByProgram.map(a => `<tr><td>${a.program}</td><td class="text-right">${a.pending}</td><td class="text-right">${a.approved}</td><td class="text-right">${a.rejected}</td><td class="text-right font-bold">${a.pending + a.approved + a.rejected}</td></tr>`).join("")}
            </tbody>
          </table>

          <h2>Monthly Revenue & Expenses</h2>
          <table>
            <thead><tr><th>Month</th><th class="text-right">Revenue</th><th class="text-right">Expenses</th><th class="text-right">Profit</th></tr></thead>
            <tbody>
              ${revenueByMonth.map(m => `<tr><td>${m.month}</td><td class="text-right">$${m.revenue.toLocaleString()}</td><td class="text-right">$${m.expenses.toLocaleString()}</td><td class="text-right font-bold">$${(m.revenue - m.expenses).toLocaleString()}</td></tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const totalRevenue = revenueByMonth.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = revenueByMonth.reduce((s, m) => s + m.expenses, 0);
  const totalShipments = shipmentsByDestination.reduce((s, d) => s + d.count, 0);
  const totalApps = applicationsByProgram.reduce((s, a) => s + a.pending + a.approved + a.rejected, 0);

  return (
    <AdminLayout>
      <div className="space-y-6" ref={reportRef}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Analytics & Reports</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Comprehensive platform insights with exportable reports.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[130px] h-9 text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-1.5 h-9 text-[13px] font-semibold rounded-lg px-4" onClick={handleExportPDF}>
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, change: "+18.2%", icon: DollarSign, color: "text-accent", bg: "bg-accent/15" },
            { label: "Shipments", value: totalShipments, change: "+12.5%", icon: Package, color: "text-primary", bg: "bg-primary/10" },
            { label: "Applications", value: totalApps, change: "+24.8%", icon: FileText, color: "text-secondary", bg: "bg-secondary/15" },
            { label: "Active Users", value: "1,210", change: "+9.3%", icon: Users, color: "text-primary", bg: "bg-primary/10" },
          ].map(s => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                  <Badge variant="secondary" className="text-[10px] bg-secondary/10 text-secondary border-0"><TrendingUp className="w-3 h-3 mr-0.5" />{s.change}</Badge>
                </div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="revenue">
          <TabsList className="flex-wrap">
            <TabsTrigger value="revenue"><DollarSign className="w-4 h-4 mr-1.5" />Revenue</TabsTrigger>
            <TabsTrigger value="shipments"><Package className="w-4 h-4 mr-1.5" />Shipments</TabsTrigger>
            <TabsTrigger value="applications"><FileText className="w-4 h-4 mr-1.5" />Applications</TabsTrigger>
            <TabsTrigger value="growth"><TrendingUp className="w-4 h-4 mr-1.5" />Growth</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="grid lg:grid-cols-5 gap-4 mt-4">
              <Card className="lg:col-span-3 shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Revenue vs Expenses</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 18%, 90%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="hsl(168, 76%, 42%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="hsl(204, 81%, 21%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Revenue by Service</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={revenueByService} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                        {revenueByService.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {revenueByService.map(s => (
                      <div key={s.name} className="flex items-center gap-2 text-[11px]">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-muted-foreground truncate">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <Card className="shadow-card rounded-xl border border-border/60 mt-4">
              <CardHeader className="pb-2"><CardTitle className="text-[15px]">Payment Method Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
                        {paymentMethods.map((m, i) => <Cell key={i} fill={m.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {paymentMethods.map(m => (
                      <div key={m.name} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                        <span className="text-sm font-medium text-foreground">{m.name}</span>
                        <span className="text-sm font-bold text-foreground">{m.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipments Tab */}
          <TabsContent value="shipments">
            <div className="grid lg:grid-cols-2 gap-4 mt-4">
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Shipments by Destination</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={shipmentsByDestination} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 18%, 90%)" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="destination" type="category" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Total" fill="hsl(204, 81%, 21%)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="onTime" name="On-Time" fill="hsl(168, 76%, 42%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Delivery Performance</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shipmentsByDestination.map(s => {
                      const rate = Math.round(s.onTime / s.count * 100);
                      return (
                        <div key={s.destination}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-foreground">{s.destination}</span>
                            <span className="text-muted-foreground">{rate}% on-time</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, backgroundColor: rate >= 90 ? "hsl(168, 76%, 42%)" : "hsl(44, 100%, 48%)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <div className="grid lg:grid-cols-5 gap-4 mt-4">
              <Card className="lg:col-span-3 shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Applications by Program</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={applicationsByProgram}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 18%, 90%)" />
                      <XAxis dataKey="program" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="approved" name="Approved" fill="hsl(168, 76%, 42%)" stackId="a" />
                      <Bar dataKey="pending" name="Pending" fill="hsl(44, 100%, 48%)" stackId="a" />
                      <Bar dataKey="rejected" name="Rejected" fill="hsl(0, 84%, 60%)" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Approval Rates</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applicationsByProgram.map(a => {
                      const total = a.pending + a.approved + a.rejected;
                      const rate = Math.round(a.approved / total * 100);
                      return (
                        <div key={a.program}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-foreground text-[12px]">{a.program}</span>
                            <Badge variant={rate >= 80 ? "default" : "secondary"} className="text-[10px]">{rate}%</Badge>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${rate}%` }} />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{a.approved} approved / {total} total</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Growth Tab */}
          <TabsContent value="growth">
            <Card className="shadow-card rounded-xl border border-border/60 mt-4">
              <CardHeader className="pb-2"><CardTitle className="text-[15px]">Weekly Growth Trends</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 18%, 90%)" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" name="New Users" stroke="hsl(204, 81%, 21%)" fill="hsl(204, 81%, 21%)" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="bookings" name="Bookings" stroke="hsl(168, 76%, 42%)" fill="hsl(168, 76%, 42%)" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="applications" name="Applications" stroke="hsl(44, 100%, 48%)" fill="hsl(44, 100%, 48%)" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Profit Summary */}
            <div className="grid lg:grid-cols-3 gap-4 mt-4">
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardContent className="p-5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground mt-1">${totalRevenue.toLocaleString()}</p>
                  <p className="text-[12px] text-secondary mt-1 font-medium">+18.2% vs last year</p>
                </CardContent>
              </Card>
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardContent className="p-5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Total Expenses</p>
                  <p className="text-3xl font-bold text-foreground mt-1">${totalExpenses.toLocaleString()}</p>
                  <p className="text-[12px] text-muted-foreground mt-1">Operating costs</p>
                </CardContent>
              </Card>
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardContent className="p-5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Net Profit</p>
                  <p className="text-3xl font-bold text-secondary mt-1">${(totalRevenue - totalExpenses).toLocaleString()}</p>
                  <p className="text-[12px] text-secondary mt-1 font-medium">{Math.round((totalRevenue - totalExpenses) / totalRevenue * 100)}% margin</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
