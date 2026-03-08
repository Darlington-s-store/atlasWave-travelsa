import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, FileText, Clock, AlertTriangle, CheckCircle, Eye, MoreVertical, Plus, Filter } from "lucide-react";

const mockApplications = [
  { id: "PSP-9821", applicant: "John Doe", type: "Canada LMIA", date: "Oct 24, 2023", status: "Pending", priority: "HIGH" },
  { id: "PSP-9756", applicant: "Alice Smith", type: "Germany Opportunity Card", date: "Oct 23, 2023", status: "In Review", priority: "MEDIUM" },
  { id: "PSP-9712", applicant: "Robert Brown", type: "Flight Booking", date: "Oct 22, 2023", status: "Approved", priority: "LOW" },
  { id: "PSP-9688", applicant: "Elena Valdez", type: "Visa Stamping", date: "Oct 21, 2023", status: "Doc Requested", priority: "HIGH" },
  { id: "PSP-9642", applicant: "Kevin Lee", type: "Canada LMIA", date: "Oct 20, 2023", status: "Approved", priority: "MEDIUM" },
  { id: "PSP-9601", applicant: "Ama Mensah", type: "Work Permit", date: "Oct 19, 2023", status: "Pending", priority: "HIGH" },
  { id: "PSP-9589", applicant: "Kofi Boateng", type: "Credential Eval", date: "Oct 18, 2023", status: "In Review", priority: "LOW" },
  { id: "PSP-9570", applicant: "Yaa Serwaa", type: "Chancenkarte", date: "Oct 17, 2023", status: "Approved", priority: "MEDIUM" },
];

const activityLog = [
  "System approved application #GP-9712 automatically.",
  "Agent Mark requested additional documents for #GP-9688.",
  "New application #PSP-9821 submitted by John Doe.",
];

const statusStyle: Record<string, string> = {
  Pending: "bg-accent/15 text-accent-foreground",
  "In Review": "bg-primary/15 text-primary",
  Approved: "bg-secondary/15 text-secondary",
  "Doc Requested": "bg-destructive/15 text-destructive",
};

const priorityStyle: Record<string, string> = {
  HIGH: "text-destructive",
  MEDIUM: "text-accent-foreground",
  LOW: "text-muted-foreground",
};

const ITEMS_PER_PAGE = 5;

const AdminApplications = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = mockApplications.filter(a => {
    const matchesSearch = a.applicant.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesService = serviceFilter === "all" || a.type === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const statCards = [
    { label: "TOTAL APPS", value: "1,284", icon: FileText, color: "hsl(var(--primary))" },
    { label: "PENDING REVIEW", value: "156", icon: Clock, color: "hsl(var(--accent))" },
    { label: "URGENT ACTION", value: "24", icon: AlertTriangle, color: "hsl(var(--destructive))" },
    { label: "COMPLETED TODAY", value: "42", icon: CheckCircle, color: "hsl(var(--secondary))" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Application Management</h2>
            <p className="text-sm text-muted-foreground">Main Menu &gt; Active Applications</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="shadow-card text-center">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Row */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, ID or passport..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Doc Requested">Doc Requested</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={v => { setServiceFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue placeholder="All Services" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="Canada LMIA">Canada LMIA</SelectItem>
                    <SelectItem value="Germany Opportunity Card">Germany Opportunity Card</SelectItem>
                    <SelectItem value="Flight Booking">Flight Booking</SelectItem>
                    <SelectItem value="Visa Stamping">Visa Stamping</SelectItem>
                    <SelectItem value="Work Permit">Work Permit</SelectItem>
                    <SelectItem value="Credential Eval">Credential Eval</SelectItem>
                    <SelectItem value="Chancenkarte">Chancenkarte</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" /> New Application
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>APPLICATION ID</TableHead>
                  <TableHead>APPLICANT</TableHead>
                  <TableHead>SERVICE TYPE</TableHead>
                  <TableHead>DATE SUBMITTED</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>PRIORITY</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs text-primary font-semibold">{app.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {app.applicant.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium text-foreground">{app.applicant}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{app.type}</TableCell>
                    <TableCell className="text-muted-foreground">{app.date}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[app.status] || ""}`}>
                        {app.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold ${priorityStyle[app.priority] || ""}`}>
                        ↑ {app.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
              </p>
              {totalPages > 1 && (
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activityLog.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-foreground">{log}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminApplications;
