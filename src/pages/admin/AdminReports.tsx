import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download, FileText, Users, Plane, CreditCard, Package, BarChart3,
  Calendar, Inbox, TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--destructive))", "#6366f1", "#f59e0b"];

type ReportType = "users" | "bookings" | "payments" | "shipments" | "revenue";

const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => headers.map(h => {
      const val = String(row[h] ?? "");
      return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(","))
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};

const AdminReports = () => {
  const { toast } = useToast();
  const [activeReport, setActiveReport] = useState<ReportType>("revenue");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  // Data
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const [u, b, p, s] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("shipments").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(u.data || []);
    setBookings(b.data || []);
    setPayments(p.data || []);
    setShipments(s.data || []);
    setLoading(false);
  };

  const filterByDate = (items: any[]) => {
    return items.filter(i => {
      const d = new Date(i.created_at);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  };

  const filteredPayments = filterByDate(payments);
  const filteredBookings = filterByDate(bookings);
  const filteredShipments = filterByDate(shipments);

  const totalRevenue = filteredPayments.filter(p => p.status === "paid" || p.status === "Paid").reduce((s, p) => s + Number(p.amount || 0), 0);
  const avgPayment = filteredPayments.length > 0 ? totalRevenue / filteredPayments.filter(p => p.status === "paid" || p.status === "Paid").length : 0;

  // Revenue by month
  const revenueByMonth: Record<string, number> = {};
  filteredPayments.filter(p => p.status === "paid" || p.status === "Paid").forEach(p => {
    const month = new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(p.amount || 0);
  });
  const revenueChartData = Object.entries(revenueByMonth).map(([month, amount]) => ({ month, amount }));

  // Payment methods
  const methodBreakdown: Record<string, number> = {};
  filteredPayments.forEach(p => {
    const m = p.payment_method || "Unknown";
    methodBreakdown[m] = (methodBreakdown[m] || 0) + 1;
  });
  const methodChartData = Object.entries(methodBreakdown).map(([name, value]) => ({ name, value }));

  // Shipment destinations
  const destBreakdown: Record<string, number> = {};
  filteredShipments.forEach(s => {
    destBreakdown[s.destination] = (destBreakdown[s.destination] || 0) + 1;
  });
  const destChartData = Object.entries(destBreakdown).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  const handleExport = (type: ReportType) => {
    let data: any[] = [];
    let filename = type;
    switch (type) {
      case "users":
        data = users.map(u => ({ id: u.id, name: u.full_name || "", phone: u.phone || "", joined: u.created_at }));
        break;
      case "bookings":
        data = filteredBookings.map(b => ({ id: b.id, type: b.type, route: b.route, date: b.date, status: b.status, provider: b.provider || "", created: b.created_at }));
        break;
      case "payments":
        data = filteredPayments.map(p => ({ id: p.id, amount: p.amount, currency: p.currency, status: p.status, method: p.payment_method || "", description: p.description || "", reference: p.reference || "", created: p.created_at }));
        break;
      case "shipments":
        data = filteredShipments.map(s => ({ tracking: s.tracking_number, origin: s.origin, destination: s.destination, status: s.status, progress: s.progress, eta: s.eta || "", weight: s.weight || "", created: s.created_at }));
        break;
      case "revenue":
        data = revenueChartData.map(r => ({ month: r.month, revenue: r.amount }));
        filename = "revenue_summary";
        break;
    }
    if (data.length === 0) {
      toast({ title: "No Data", description: "No data available to export.", variant: "destructive" });
      return;
    }
    downloadCSV(data, filename);
    toast({ title: "Exported", description: `${type} report downloaded as CSV.` });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Reports & Analytics</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Generate and export platform reports.</p>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card className="shadow-card rounded-xl border border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">From</Label>
                <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 text-[13px] w-[160px]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">To</Label>
                <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 text-[13px] w-[160px]" />
              </div>
              <Button variant="outline" size="sm" className="h-9" onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear</Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Users", value: users.length, icon: Users, bg: "bg-primary/10", color: "text-primary" },
            { label: "Bookings", value: filteredBookings.length, icon: Plane, bg: "bg-accent/15", color: "text-accent" },
            { label: "Payments", value: filteredPayments.length, icon: CreditCard, bg: "bg-secondary/15", color: "text-secondary" },
            { label: "Shipments", value: filteredShipments.length, icon: Package, bg: "bg-primary/10", color: "text-primary" },
            { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, bg: "bg-secondary/15", color: "text-secondary" },
          ].map(s => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{loading ? "—" : s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeReport} onValueChange={v => setActiveReport(v as ReportType)}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport("revenue")}><Download className="w-4 h-4" /> Export CSV</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Revenue Trend</CardTitle></CardHeader>
                <CardContent>
                  {revenueChartData.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-center">
                      <div><Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" /><p className="text-[13px] text-muted-foreground">No revenue data yet</p></div>
                    </div>
                  ) : (
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Payment Methods</CardTitle></CardHeader>
                <CardContent>
                  {methodChartData.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-center">
                      <div><Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" /><p className="text-[13px] text-muted-foreground">No payment data yet</p></div>
                    </div>
                  ) : (
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart><Pie data={methodChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{methodChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Pie><Tooltip /></PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport("users")}><Download className="w-4 h-4" /> Export CSV</Button>
            </div>
            <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
              <CardContent className="p-0">
                {users.length === 0 ? (
                  <div className="py-16 text-center"><Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" /><p className="text-[13px] text-muted-foreground">No users found</p></div>
                ) : (
                  <Table>
                    <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead className="text-[11px] uppercase tracking-wider font-bold">Name</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Phone</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Joined</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {users.slice(0, 50).map(u => (
                        <TableRow key={u.id} className="hover:bg-muted/20"><TableCell className="text-[13px] font-semibold">{u.full_name || "Unnamed"}</TableCell><TableCell className="text-[13px] text-muted-foreground">{u.phone || "—"}</TableCell><TableCell className="text-[13px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport("bookings")}><Download className="w-4 h-4" /> Export CSV</Button>
            </div>
            <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
              <CardContent className="p-0">
                {filteredBookings.length === 0 ? (
                  <div className="py-16 text-center"><Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" /><p className="text-[13px] text-muted-foreground">No bookings found</p></div>
                ) : (
                  <Table>
                    <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead className="text-[11px] uppercase tracking-wider font-bold">Type</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Route</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredBookings.slice(0, 50).map(b => (
                        <TableRow key={b.id} className="hover:bg-muted/20"><TableCell className="text-[13px] capitalize">{b.type}</TableCell><TableCell className="text-[13px]">{b.route}</TableCell><TableCell className="text-[13px] text-muted-foreground">{b.date}</TableCell><TableCell><span className="text-[11px] font-bold capitalize">{b.status}</span></TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport("payments")}><Download className="w-4 h-4" /> Export CSV</Button>
            </div>
            <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
              <CardContent className="p-0">
                {filteredPayments.length === 0 ? (
                  <div className="py-16 text-center"><Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" /><p className="text-[13px] text-muted-foreground">No payments found</p></div>
                ) : (
                  <Table>
                    <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead className="text-[11px] uppercase tracking-wider font-bold">Amount</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Method</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Description</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredPayments.slice(0, 50).map(p => (
                        <TableRow key={p.id} className="hover:bg-muted/20"><TableCell className="text-[13px] font-bold">${Number(p.amount).toLocaleString()}</TableCell><TableCell className="text-[13px]">{p.payment_method || "—"}</TableCell><TableCell><span className="text-[11px] font-bold capitalize">{p.status}</span></TableCell><TableCell className="text-[13px] text-muted-foreground">{p.description || "—"}</TableCell><TableCell className="text-[13px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipments Tab */}
          <TabsContent value="shipments" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              {destChartData.length > 0 && <span className="text-[12px] text-muted-foreground font-medium">Top destinations shown</span>}
              <Button variant="outline" size="sm" className="gap-1.5 ml-auto" onClick={() => handleExport("shipments")}><Download className="w-4 h-4" /> Export CSV</Button>
            </div>
            {destChartData.length > 0 && (
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-[15px]">Top Destinations</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={destChartData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" fontSize={11} /><YAxis dataKey="name" type="category" fontSize={11} width={100} /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} /></BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
              <CardContent className="p-0">
                {filteredShipments.length === 0 ? (
                  <div className="py-16 text-center"><Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" /><p className="text-[13px] text-muted-foreground">No shipments found</p></div>
                ) : (
                  <Table>
                    <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30"><TableHead className="text-[11px] uppercase tracking-wider font-bold">Tracking</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Origin</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Destination</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Progress</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredShipments.slice(0, 50).map(s => (
                        <TableRow key={s.id} className="hover:bg-muted/20"><TableCell className="text-[12px] font-mono font-bold text-primary">{s.tracking_number}</TableCell><TableCell className="text-[13px]">{s.origin}</TableCell><TableCell className="text-[13px]">{s.destination}</TableCell><TableCell><span className="text-[11px] font-bold capitalize">{s.status}</span></TableCell><TableCell className="text-[13px]">{s.progress}%</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
