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
  { text: "System approved application #GP-9712 automatically.", time: "10 minutes ago" },
  { text: "Agent Mark requested additional documents for #GP-9688.", time: "1 hour ago" },
  { text: "New application #PSP-9821 submitted by John Doe.", time: "2 hours ago" },
];

const statusStyle: Record<string, string> = {
  Pending: "bg-accent/15 text-accent-foreground border border-accent/25",
  "In Review": "bg-primary/10 text-primary border border-primary/20",
  Approved: "bg-secondary/15 text-secondary border border-secondary/25",
  "Doc Requested": "bg-destructive/10 text-destructive border border-destructive/20",
};

const priorityStyle: Record<string, { color: string; label: string }> = {
  HIGH: { color: "text-destructive", label: "↑ HIGH" },
  MEDIUM: { color: "text-accent-foreground", label: "↕ MEDIUM" },
  LOW: { color: "text-muted-foreground", label: "↓ LOW" },
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
    { label: "TOTAL APPS", value: "1,284", icon: FileText, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "PENDING REVIEW", value: "156", icon: Clock, iconBg: "bg-accent/15", iconColor: "text-accent" },
    { label: "URGENT ACTION", value: "24", icon: AlertTriangle, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
    { label: "COMPLETED TODAY", value: "42", icon: CheckCircle, iconBg: "bg-secondary/15", iconColor: "text-secondary" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Application Management</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Main Menu &gt; Active Applications</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60 text-center hover:shadow-card-hover transition-all">
              <CardContent className="p-5">
                <div className={`w-11 h-11 rounded-xl mx-auto flex items-center justify-center mb-3 ${s.iconBg}`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">{s.label}</p>
                <p className="text-[26px] font-bold text-foreground mt-1 tracking-tight">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Row */}
        <Card className="shadow-card rounded-xl border border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, ID or passport..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9 text-[13px]" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Filter className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-medium">Filters</span>
                </div>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[140px] h-9 text-[13px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Doc Requested">Doc Requested</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={v => { setServiceFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-[160px] h-9 text-[13px]"><SelectValue placeholder="All Services" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="Canada LMIA">Canada LMIA</SelectItem>
                    <SelectItem value="Germany Opportunity Card">Opportunity Card</SelectItem>
                    <SelectItem value="Flight Booking">Flight Booking</SelectItem>
                    <SelectItem value="Visa Stamping">Visa Stamping</SelectItem>
                    <SelectItem value="Work Permit">Work Permit</SelectItem>
                    <SelectItem value="Credential Eval">Credential Eval</SelectItem>
                    <SelectItem value="Chancenkarte">Chancenkarte</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="gap-1.5 h-9 text-[13px] font-semibold rounded-lg px-4">
                  <Plus className="w-4 h-4" /> New Application
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Application ID</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Applicant</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Service Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Date Submitted</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Priority</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map(app => (
                  <TableRow key={app.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-[12px] text-primary font-bold">{app.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          {app.applicant.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-semibold text-[13px] text-foreground">{app.applicant}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{app.type}</TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{app.date}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusStyle[app.status] || ""}`}>
                        {app.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[11px] font-bold ${priorityStyle[app.priority]?.color || ""}`}>
                        {priorityStyle[app.priority]?.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><MoreVertical className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
              <p className="text-[12px] text-muted-foreground font-medium">
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
        <Card className="shadow-card rounded-xl border border-border/60">
          <CardHeader className="pb-2 pt-5 px-6">
            <CardTitle className="text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Recent Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5 space-y-3">
            {activityLog.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-[13px] text-foreground">{log.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminApplications;
