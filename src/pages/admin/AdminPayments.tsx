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
import { DollarSign, Clock, CheckCircle, Download, Plus, MoreHorizontal } from "lucide-react";
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
  Paid: "bg-secondary/15 text-secondary",
  Pending: "bg-accent/15 text-accent-foreground",
  Failed: "bg-destructive/15 text-destructive",
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Payment Monitoring</h2>
            <p className="text-sm text-muted-foreground">Monitor and manage global transactions in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-4 h-4" /> Export Report
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Manual Payment
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <DollarSign className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground">$128,450.00</p>
              <p className="text-xs text-muted-foreground mt-1">
                vs. $114,200 last month <span className="text-secondary font-semibold ml-1">+12.5%</span>
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground">42 <span className="text-sm font-normal text-destructive">-5%</span></p>
              <p className="text-xs text-muted-foreground mt-1">Avg. processing time: 4.2h</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Successful Transactions</p>
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground">1,205 <span className="text-sm font-normal text-secondary">+8%</span></p>
              <p className="text-xs text-muted-foreground mt-1">98.2% Success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 shadow-card">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
              <Tabs defaultValue="daily">
                <TabsList className="h-8">
                  <TabsTrigger value="daily" className="text-xs px-3 h-7">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs px-3 h-7">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs px-3 h-7">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                      formatter={(value: number) => [`$${(value / 1000).toFixed(1)}k`, "Revenue"]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {revenueData.map((_, index) => (
                        <Cell key={index} fill={index === revenueData.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.35)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Payment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                      stroke="none"
                    >
                      {paymentDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <text x="50%" y="48%" textAnchor="middle" className="text-xl font-bold fill-foreground">68%</text>
                    <text x="50%" y="60%" textAnchor="middle" className="text-[10px] fill-muted-foreground uppercase tracking-wider">MASTERCARD</text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {paymentDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap">
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Status: All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status: All</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} transactions
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TRANSACTION ID</TableHead>
                  <TableHead>USER</TableHead>
                  <TableHead>SERVICE</TableHead>
                  <TableHead>AMOUNT</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>METHOD</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs text-primary font-semibold">{tx.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {tx.user.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium text-foreground">{tx.user}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{tx.service}</TableCell>
                    <TableCell className="font-semibold text-foreground">{tx.amount}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[tx.status] || ""}`}>
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{tx.method}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex justify-center py-3 border-t border-border">
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
