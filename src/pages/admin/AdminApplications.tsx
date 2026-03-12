import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, FileText, Clock, AlertTriangle, CheckCircle, Plus, Filter, MoreVertical, Eye, Pencil, Trash2, Inbox, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { notifyStatusChange } from "@/lib/notifyStatusChange";

const SERVICE_TYPES = ["Canada LMIA", "Germany Opportunity Card", "Flight Booking", "Visa Stamping", "Work Permit", "Credential Eval", "Chancenkarte"];
const STATUSES = ["pending", "in_review", "approved", "doc_requested", "rejected"];
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  doc_requested: "Doc Requested",
  rejected: "Rejected",
};

const statusStyle: Record<string, string> = {
  pending: "bg-accent/15 text-accent-foreground border border-accent/25",
  in_review: "bg-primary/10 text-primary border border-primary/20",
  approved: "bg-secondary/15 text-secondary border border-secondary/25",
  doc_requested: "bg-destructive/10 text-destructive border border-destructive/20",
  rejected: "bg-destructive/15 text-destructive border border-destructive/25",
};

const AdminApplications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [viewingApp, setViewingApp] = useState<any | null>(null);
  const [deletingApp, setDeletingApp] = useState<any | null>(null);

  // Form state
  const [form, setForm] = useState({ title: "", type: SERVICE_TYPES[0], status: "pending", details: "" });

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*, profiles:user_id(full_name)")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setApplications(data || []);
    setLoading(false);
  };

  const resetForm = () => setForm({ title: "", type: SERVICE_TYPES[0], status: "pending", details: "" });

  const openCreate = () => { resetForm(); setEditingApp(null); setDialogOpen(true); };
  const openEdit = (app: any) => {
    setEditingApp(app);
    setForm({ title: app.title, type: app.type, status: app.status, details: app.details || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
      return;
    }
    if (editingApp) {
      const previousStatus = editingApp.status;
      const { error } = await supabase
        .from("applications")
        .update({ title: form.title, type: form.type, status: form.status, details: form.details })
        .eq("id", editingApp.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Application Updated" });
      
      // Send notification if status changed
      if (previousStatus !== form.status) {
        notifyStatusChange({
          type: "application_status_update",
          userId: editingApp.user_id,
          data: {
            title: form.title,
            type: form.type,
            previousStatus: STATUS_LABELS[previousStatus] || previousStatus,
            newStatus: STATUS_LABELS[form.status] || form.status,
            notes: form.details || "",
          },
        });
      }
    } else {
      // For admin-created applications, we need a user_id - this would typically be selected
      toast({ title: "Info", description: "Applications are created by users. Use this to manage existing ones." });
      setDialogOpen(false);
      return;
    }
    setDialogOpen(false);
    resetForm();
    fetchApplications();
  };

  const updateStatus = async (app: any, newStatus: string) => {
    const previousStatus = app.status;
    const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", app.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Status Updated" });
    
    // Send notification
    notifyStatusChange({
      type: "application_status_update",
      userId: app.user_id,
      data: {
        title: app.title,
        type: app.type,
        previousStatus: STATUS_LABELS[previousStatus] || previousStatus,
        newStatus: STATUS_LABELS[newStatus] || newStatus,
        notes: "",
      },
    });
    fetchApplications();
  };

  const handleDelete = async () => {
    if (deletingApp) {
      const { error } = await supabase.from("applications").delete().eq("id", deletingApp.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Application Deleted" });
    }
    setDeleteDialogOpen(false);
    setDeletingApp(null);
    fetchApplications();
  };

  const filtered = applications.filter(a => {
    const applicantName = a.profiles?.full_name || "";
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                          a.id.toLowerCase().includes(search.toLowerCase()) ||
                          applicantName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesService = serviceFilter === "all" || a.type === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  const counts = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    inReview: applications.filter(a => a.status === "in_review").length,
    approved: applications.filter(a => a.status === "approved").length,
  };

  const statCards = [
    { label: "TOTAL APPS", value: counts.total, icon: FileText, iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "PENDING", value: counts.pending, icon: Clock, iconBg: "bg-accent/15", iconColor: "text-accent" },
    { label: "IN REVIEW", value: counts.inReview, icon: AlertTriangle, iconBg: "bg-primary/10", iconColor: "text-primary" },
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
                <Input placeholder="Search by name, title, or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
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
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[160px] h-9 text-[13px]"><SelectValue placeholder="All Services" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table or Empty State */}
        <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-[13px]">Loading...</p></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-[15px] font-semibold text-foreground">No applications yet</p>
                <p className="text-[13px] text-muted-foreground mt-1 max-w-[300px]">
                  Applications will appear here when users submit them.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Applicant</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Title</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Service</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(app => (
                      <TableRow key={app.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                              {(app.profiles?.full_name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="font-semibold text-[13px] text-foreground">{app.profiles?.full_name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-foreground font-medium">{app.title}</TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{app.type}</TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusStyle[app.status] || ""}`}>
                            {STATUS_LABELS[app.status] || app.status}
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => updateStatus(app, "in_review")}>
                                <Clock className="w-4 h-4 mr-2" /> Mark In Review
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(app, "approved")}>
                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(app, "rejected")}>
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
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

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Application title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} placeholder="Additional notes..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>Save Changes</Button>
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
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Applicant</span>
                  {viewingApp.profiles?.full_name || "Unknown"}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Title</span>
                  {viewingApp.title}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Service Type</span>
                  {viewingApp.type}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${statusStyle[viewingApp.status] || ""}`}>
                    {STATUS_LABELS[viewingApp.status] || viewingApp.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Created</span>
                  {new Date(viewingApp.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Updated</span>
                  {new Date(viewingApp.updated_at).toLocaleDateString()}
                </div>
              </div>
              {viewingApp.details && (
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Details</span>
                  <p className="text-[13px] text-foreground">{viewingApp.details}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground py-2">
            Are you sure you want to delete this application? This action cannot be undone.
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
