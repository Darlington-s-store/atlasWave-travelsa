import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Clock, CheckCircle, Download, Plus, MoreHorizontal, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";

const revenueData = [
  { day: "01 Oct", value: 8000 },
  { day: "07 Oct", value: 12000 },
  { day: "14 Oct", value: 9500 },
  { day: "21 Oct", value: 15000 },
  { day: "Today", value: 22000 },
];

const paymentDistribution = [
  { name: "Mastercard", value: 68, amount: "$87.3k", color: "hsl(var(--primary))" },
  { name: "Mobile Money (MoMo)", value: 32, amount: "$41.1k", color: "hsl(var(--accent))" },
];

const transactions = [
  { id: "#TR-92831", user: "Elena Jacobs", service: "Visa Processing", amount: "$1,250.00", date: "Oct 24, 2023", status: "Paid", method: "Mastercard" },
  { id: "#TR-92832", user: "Marcus Wright", service: "Logistics Support", amount: "$450.00", date: "Oct 24, 2023", status: "Pending", method: "MoMo" },
  { id: "#TR-92833", user: "Sara Ross", service: "Consultation Fee", amount: "$150.00", date: "Oct 23, 2023", status: "Failed", method: "Mastercard" },
  { id: "#TR-92834", user: "Kevin Baker", service: "Education Visa", amount: "$2,800.00", date: "Oct 23, 2023", status: "Paid", method: "MoMo" },
  { id: "#TR-92835", user: "Ama Mensah", service: "Work Permit", amount: "$1,800.00", date: "Oct 22, 2023", status: "Paid", method: "Mastercard" },
  { id: "#TR-92836", user: "Kofi Boateng", service: "Flight Booking", amount: "$620.00", date: "Oct 22, 2023", status: "Pending", method: "MoMo" },
];

const statusStyle: Record<string, string> = {
  Paid: "bg-secondary/15 text-secondary border border-secondary/25",
  Pending: "bg-accent/15 text-accent-foreground border border-accent/25",
  Failed: "bg-destructive/10 text-destructive border border-destructive/20",
};

const ITEMS_PER_PAGE = 4;

const AdminPayments = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = transactions.filter(t => statusFilter === "all" || t.status === statusFilter);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Payment Monitoring</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Monitor and manage global transactions in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-[13px] rounded-lg">
              <Download className="w-4 h-4" /> Export Report
            </Button>
            <Button size="sm" className="gap-1.5 h-9 text-[13px] font-semibold rounded-lg px-4">
              <Plus className="w-4 h-4" /> Manual Payment
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</p>
                <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-accent" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-foreground tracking-tight">$128,450.00</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[12px] text-muted-foreground">vs. $114,200 last month</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3" /> +12.5%
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Pending Payments</p>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-[28px] font-bold text-foreground tracking-tight">42</p>
                <span className="text-[11px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">-5%</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-1">Avg. processing time: 4.2h</p>
            </CardContent>
          </Card>
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Successful Transactions</p>
                <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-[28px] font-bold text-foreground tracking-tight">1,205</p>
                <span className="text-[11px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">+8%</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-1">98.2% Success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3 shadow-card rounded-xl border border-border/60">
            <CardHeader className="flex-row items-center justify-between pb-1 pt-5 px-6">
              <CardTitle className="text-[15px] font-semibold text-foreground">Revenue Trend</CardTitle>
              <Tabs defaultValue="daily">
                <TabsList className="h-8 bg-muted/50 p-0.5">
                  <TabsTrigger value="daily" className="text-[11px] px-3 h-7 font-medium">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-[11px] px-3 h-7 font-medium">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-[11px] px-3 h-7 font-medium">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} barSize={32} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${v / 1000}k`} width={45} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                      contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", boxShadow: "0 4px 16px -4px rgba(0,0,0,0.1)", fontSize: 13, padding: "8px 14px" }}
                      formatter={(value: number) => [`$${(value / 1000).toFixed(1)}k`, "Revenue"]}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {revenueData.map((_, index) => (
                        <Cell key={index} fill={index === revenueData.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-card rounded-xl border border-border/60">
            <CardHeader className="pt-5 px-6 pb-0">
              <CardTitle className="text-[15px] font-semibold text-foreground">Payment Distribution</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <div className="h-[160px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      dataKey="value"
                      stroke="none"
                      strokeWidth={0}
                    >
                      {paymentDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <text x="50%" y="46%" textAnchor="middle" className="fill-foreground text-[20px] font-bold">68%</text>
                    <text x="50%" y="58%" textAnchor="middle" className="fill-muted-foreground text-[9px] uppercase tracking-[0.15em] font-semibold">Mastercard</text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5 mt-2">
                {paymentDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[13px] font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="text-[13px] font-bold text-foreground">{item.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Table */}
        <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap">
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-9 text-[13px]"><SelectValue placeholder="Status: All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status: All</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-[12px] text-muted-foreground font-medium ml-auto">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} transactions
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Transaction ID</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">User</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Service</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Amount</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Method</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map(tx => (
                  <TableRow key={tx.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-[12px] text-primary font-bold">{tx.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          {tx.user.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-semibold text-[13px] text-foreground">{tx.user}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{tx.service}</TableCell>
                    <TableCell className="text-[13px] font-bold text-foreground">{tx.amount}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{tx.date}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusStyle[tx.status] || ""}`}>
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground font-medium">{tx.method}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex justify-center py-3 border-t border-border bg-muted/20">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink href="#" isActive={page === i + 1} onClick={e => { e.preventDefault(); setPage(i + 1); }}>
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext href="#" onClick={e => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
