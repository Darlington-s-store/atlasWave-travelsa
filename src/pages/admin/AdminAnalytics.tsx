import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import {
  Download, DollarSign, Package, FileText, Users, TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CURRENCY, formatCompactCurrency, formatCurrency } from "@/lib/currency";

const AdminAnalytics = () => {
  const [period, setPeriod] = useState("yearly");
  const reportRef = useRef<HTMLDivElement>(null);

  const [payments, setPayments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [payR, appR, shipR, bookR, profR, consR] = await Promise.all([
        supabase.from("payments").select("*"),
        supabase.from("applications").select("*"),
        supabase.from("shipments").select("*"),
        supabase.from("bookings").select("*"),
        supabase.from("profiles").select("*"),
        supabase.from("consultations").select("*"),
      ]);
      setPayments(payR.data || []);
      setApplications(appR.data || []);
      setShipments(shipR.data || []);
      setBookings(bookR.data || []);
      setProfiles(profR.data || []);
      setConsultations(consR.data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Derive revenue by month from payments
  const revenueByMonth = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const map: Record<string, number> = {};
    months.forEach(m => { map[m] = 0; });
    payments.filter(p => p.status === "completed" || p.status === "paid").forEach(p => {
      const d = new Date(p.created_at);
      const m = months[d.getMonth()];
      map[m] += Number(p.amount);
    });
    return months.map(m => ({ month: m, revenue: map[m] }));
  })();

  // Revenue by payment method
  const paymentMethodData = (() => {
    const map: Record<string, number> = {};
    payments.forEach(p => {
      const method = p.payment_method || "Card";
      map[method] = (map[method] || 0) + 1;
    });
    const total = payments.length || 1;
    const colors: Record<string, string> = { Mastercard: "hsl(204, 81%, 21%)", MoMo: "hsl(44, 100%, 48%)", card: "hsl(204, 81%, 21%)", momo: "hsl(44, 100%, 48%)", bank_transfer: "hsl(168, 76%, 42%)" };
    return Object.entries(map).map(([name, count]) => ({
      name, value: Math.round((count / total) * 100), color: colors[name] || "hsl(210, 15%, 46%)",
    }));
  })();

  // Applications by type
  const appsByType = (() => {
    const map: Record<string, { pending: number; approved: number; rejected: number }> = {};
    applications.forEach(a => {
      if (!map[a.type]) map[a.type] = { pending: 0, approved: 0, rejected: 0 };
      if (a.status === "approved") map[a.type].approved++;
      else if (a.status === "rejected") map[a.type].rejected++;
      else map[a.type].pending++;
    });
    return Object.entries(map).map(([program, counts]) => ({ program, ...counts }));
  })();

  // Shipments by destination
  const shipsByDest = (() => {
    const map: Record<string, { count: number; delivered: number }> = {};
    shipments.forEach(s => {
      if (!map[s.destination]) map[s.destination] = { count: 0, delivered: 0 };
      map[s.destination].count++;
      if (s.status === "delivered") map[s.destination].delivered++;
    });
    return Object.entries(map).map(([destination, d]) => ({ destination, count: d.count, delivered: d.delivered }));
  })();

  const totalRevenue = payments.filter(p => p.status === "completed" || p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalShipments = shipments.length;
  const totalApps = applications.length;
  const totalUsers = profiles.length;

  // Revenue by service (description)
  const revenueByService = (() => {
    const map: Record<string, number> = {};
    payments.filter(p => p.status === "completed" || p.status === "paid").forEach(p => {
      const desc = p.description || "Other";
      map[desc] = (map[desc] || 0) + Number(p.amount);
    });
    const colors = ["hsl(204, 81%, 21%)", "hsl(168, 76%, 42%)", "hsl(44, 100%, 48%)", "hsl(0, 84%, 60%)", "hsl(210, 29%, 24%)", "hsl(210, 15%, 46%)"];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  })();

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Analytics Report — AtlasWave</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; color: #2C3E50; }
        h1 { font-size: 24px; } h2 { font-size: 18px; margin-top: 32px; color: #0A3D62; }
        .report-header { border-bottom: 2px solid #0A3D62; padding-bottom: 16px; margin-bottom: 24px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; }
        .stat-label { font-size: 11px; color: #6B7280; text-transform: uppercase; }
        .stat-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #E5E7EB; font-size: 13px; }
        th { background: #F9FAFB; font-weight: 600; text-transform: uppercase; font-size: 11px; color: #6B7280; }
        .text-right { text-align: right; } .font-bold { font-weight: 700; }
        @media print { body { padding: 20px; } }
      </style></head><body>
        <div class="report-header"><h1>📊 Analytics Report</h1>
        <p style="font-size:13px;color:#6B7280">AtlasWave Global — ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p></div>
        <div class="stats-grid">
          <div class="stat-card"><p class="stat-label">Total Revenue</p><p class="stat-value">${formatCurrency(totalRevenue, DEFAULT_CURRENCY)}</p></div>
          <div class="stat-card"><p class="stat-label">Shipments</p><p class="stat-value">${totalShipments}</p></div>
          <div class="stat-card"><p class="stat-label">Applications</p><p class="stat-value">${totalApps}</p></div>
          <div class="stat-card"><p class="stat-label">Users</p><p class="stat-value">${totalUsers}</p></div>
        </div>
        <h2>Revenue by Service</h2>
        <table><thead><tr><th>Service</th><th class="text-right">Revenue</th></tr></thead><tbody>
          ${revenueByService.map(s => `<tr><td>${s.name}</td><td class="text-right font-bold">${formatCurrency(s.value, DEFAULT_CURRENCY)}</td></tr>`).join("")}
        </tbody></table>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading analytics...</p></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6" ref={reportRef}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Analytics & Reports</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Live data from your database.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1.5 h-9 text-[13px] font-semibold rounded-lg px-4" onClick={handleExportPDF}>
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: formatCurrency(totalRevenue, DEFAULT_CURRENCY), icon: DollarSign, color: "text-accent", bg: "bg-accent/15" },
            { label: "Shipments", value: totalShipments, icon: Package, color: "text-primary", bg: "bg-primary/10" },
            { label: "Applications", value: totalApps, icon: FileText, color: "text-secondary", bg: "bg-secondary/15" },
            { label: "Users", value: totalUsers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          ].map(s => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
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
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="grid lg:grid-cols-5 gap-4 mt-4">
              <Card className="lg:col-span-3 shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Revenue by Month</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 18%, 90%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={v => formatCompactCurrency(v, DEFAULT_CURRENCY)} />
                      <Tooltip formatter={(v: number) => formatCurrency(v, DEFAULT_CURRENCY)} />
                      <Bar dataKey="revenue" name="Revenue" fill="hsl(168, 76%, 42%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Revenue by Service</CardTitle></CardHeader>
                <CardContent>
                  {revenueByService.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No revenue data yet.</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={revenueByService} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                            {revenueByService.map((s, i) => <Cell key={i} fill={s.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => formatCurrency(v, DEFAULT_CURRENCY)} />
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
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            {paymentMethodData.length > 0 && (
              <Card className="shadow-card rounded-xl border border-border/60 mt-4">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Payment Method Distribution</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" startAngle={90} endAngle={-270}>
                          {paymentMethodData.map((m, i) => <Cell key={i} fill={m.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {paymentMethodData.map(m => (
                        <div key={m.name} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                          <span className="text-sm font-medium text-foreground capitalize">{m.name}</span>
                          <span className="text-sm font-bold text-foreground">{m.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Shipments Tab */}
          <TabsContent value="shipments">
            <div className="grid lg:grid-cols-2 gap-4 mt-4">
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Shipments by Destination</CardTitle></CardHeader>
                <CardContent>
                  {shipsByDest.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No shipment data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={shipsByDest} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 18%, 90%)" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="destination" type="category" tick={{ fontSize: 12 }} width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Total" fill="hsl(204, 81%, 21%)" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="delivered" name="Delivered" fill="hsl(168, 76%, 42%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Delivery Performance</CardTitle></CardHeader>
                <CardContent>
                  {shipsByDest.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No data.</p>
                  ) : (
                    <div className="space-y-4">
                      {shipsByDest.map(s => {
                        const rate = s.count > 0 ? Math.round(s.delivered / s.count * 100) : 0;
                        return (
                          <div key={s.destination}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium text-foreground">{s.destination}</span>
                              <span className="text-muted-foreground">{rate}% delivered</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, backgroundColor: rate >= 80 ? "hsl(168, 76%, 42%)" : "hsl(44, 100%, 48%)" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <div className="grid lg:grid-cols-5 gap-4 mt-4">
              <Card className="lg:col-span-3 shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Applications by Type</CardTitle></CardHeader>
                <CardContent>
                  {appsByType.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No application data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={appsByType}>
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
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Approval Rates</CardTitle></CardHeader>
                <CardContent>
                  {appsByType.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No data.</p>
                  ) : (
                    <div className="space-y-4">
                      {appsByType.map(a => {
                        const total = a.pending + a.approved + a.rejected;
                        const rate = total > 0 ? Math.round(a.approved / total * 100) : 0;
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
                  )}
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
