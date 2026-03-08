import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, FileText, Clock, AlertTriangle, CheckCircle, Plus, Filter, MoreVertical, Eye, Pencil, Trash2, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  applicant: string;
  email: string;
  type: string;
  date: string;
  status: string;
  priority: string;
  notes: string;
}

const SERVICE_TYPES = ["Canada LMIA", "Germany Opportunity Card", "Flight Booking", "Visa Stamping", "Work Permit", "Credential Eval", "Chancenkarte"];
const STATUSES = ["Pending", "In Review", "Approved", "Doc Requested", "Rejected"];
const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];

const statusStyle: Record<string, string> = {
  Pending: "bg-accent/15 text-accent-foreground border border-accent/25",
  "In Review": "bg-primary/10 text-primary border border-primary/20",
  Approved: "bg-secondary/15 text-secondary border border-secondary/25",
  "Doc Requested": "bg-destructive/10 text-destructive border border-destructive/20",
  Rejected: "bg-destructive/15 text-destructive border border-destructive/25",
};

const priorityStyle: Record<string, { color: string; label: string }> = {
  HIGH: { color: "text-destructive", label: "↑ HIGH" },
  MEDIUM: { color: "text-accent-foreground", label: "↕ MEDIUM" },
  LOW: { color: "text-muted-foreground", label: "↓ LOW" },
};

let nextId = 1;
const generateId = () => `APP-${String(nextId++).padStart(4, "0")}`;

const AdminApplications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);

  // Form state
  const [form, setForm] = useState({ applicant: "", email: "", type: SERVICE_TYPES[0], status: "Pending", priority: "MEDIUM", notes: "" });

  const resetForm = () => setForm({ applicant: "", email: "", type: SERVICE_TYPES[0], status: "Pending", priority: "MEDIUM", notes: "" });

  const openCreate = () => { resetForm(); setEditingApp(null); setDialogOpen(true); };
  const openEdit = (app: Application) => {
    setEditingApp(app);
    setForm({ applicant: app.applicant, email: app.email, type: app.type, status: app.status, priority: app.priority, notes: app.notes });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.applicant.trim() || !form.email.trim()) {
      toast({ title: "Validation Error", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    if (editingApp) {
      setApplications(prev => prev.map(a => a.id === editingApp.id ? { ...a, ...form } : a));
      toast({ title: "Application Updated", description: `${form.applicant}'s application has been updated.` });
    } else {
      const newApp: Application = { id: generateId(), ...form, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) };
      setApplications(prev => [newApp, ...prev]);
      toast({ title: "Application Created", description: `New application for ${form.applicant} has been created.` });
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deletingApp) {
      setApplications(prev => prev.filter(a => a.id !== deletingApp.id));
      toast({ title: "Application Deleted", description: `Application ${deletingApp.id} has been removed.` });
    }
    setDeleteDialogOpen(false);
    setDeletingApp(null);
  };

  const filtered = applications.filter(a => {
    const matchesSearch = a.applicant.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesService = serviceFilter === "all" || a.type === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  const counts = {
    total: applications.length,
    pending: applications.filter(a => a.status === "Pending").length,
    urgent: applications.filter(a => a.priority === "HIGH").length,
    approved: applications.filter(a => a.status === "Approved").length,
  };

  const statCards = [
    { label: "TOTAL APPS", value: counts.total, icon: FileText, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "PENDING REVIEW", value: counts.pending, icon: Clock, iconBg: "bg-accent/15", iconColor: "text-accent" },
    { label: "URGENT ACTION", value: counts.urgent, icon: AlertTriangle, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
    { label: "APPROVED", value: counts.approved, icon: CheckCircle, iconBg: "bg-secondary/15", iconColor: "text-secondary" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Application Management</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage and track all service applications.</p>
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
                <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Filter className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-medium">Filters</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-9 text-[13px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[160px] h-9 text-[13px]"><SelectValue placeholder="All Services" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" className="gap-1.5 h-9 text-[13px] font-semibold rounded-lg px-4" onClick={openCreate}>
                  <Plus className="w-4 h-4" /> New Application
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table or Empty State */}
        <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-[15px] font-semibold text-foreground">No applications yet</p>
                <p className="text-[13px] text-muted-foreground mt-1 max-w-[300px]">
                  {applications.length === 0 ? "Create your first application to get started." : "No applications match your current filters."}
                </p>
                {applications.length === 0 && (
                  <Button className="mt-4 gap-1.5" onClick={openCreate}>
                    <Plus className="w-4 h-4" /> Create Application
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">ID</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Applicant</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Service</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Priority</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(app => (
                      <TableRow key={app.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="font-mono text-[12px] text-primary font-bold">{app.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                              {app.applicant.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <span className="font-semibold text-[13px] text-foreground block">{app.applicant}</span>
                              <span className="text-[11px] text-muted-foreground">{app.email}</span>
                            </div>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setViewingApp(app); setViewDialogOpen(true); }}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(app)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => { setDeletingApp(app); setDeleteDialogOpen(true); }}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
                  <p className="text-[12px] text-muted-foreground font-medium">
                    Showing {filtered.length} of {applications.length} applications
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingApp ? "Edit Application" : "New Application"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Applicant Name *</Label>
                <Input value={form.applicant} onChange={e => setForm(f => ({ ...f, applicant: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>{editingApp ? "Save Changes" : "Create Application"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {viewingApp && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">ID</span><span className="font-mono font-bold text-primary">{viewingApp.id}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Date</span>{viewingApp.date}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Name</span><span className="font-semibold">{viewingApp.applicant}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Email</span>{viewingApp.email}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Service</span>{viewingApp.type}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Priority</span><span className={priorityStyle[viewingApp.priority]?.color}>{priorityStyle[viewingApp.priority]?.label}</span></div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusStyle[viewingApp.status] || ""}`}>{viewingApp.status}</span>
              </div>
              {viewingApp.notes && (
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Notes</span>
                  <p className="text-[13px] text-foreground bg-muted/50 rounded-lg p-3">{viewingApp.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            {viewingApp && <Button onClick={() => { setViewDialogOpen(false); openEdit(viewingApp); }}>Edit</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground py-2">
            Are you sure you want to delete application <span className="font-bold text-foreground">{deletingApp?.id}</span> for <span className="font-bold text-foreground">{deletingApp?.applicant}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminApplications;
