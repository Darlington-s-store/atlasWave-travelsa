import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Globe, MoreHorizontal, Eye, Pencil, Inbox, CheckCircle, Clock, XCircle, FileText, LayoutGrid, List, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import KanbanBoard from "@/components/admin/KanbanBoard";

const APP_STATUSES = ["pending", "in-review", "processing", "approved", "rejected"];
const statusStyle: Record<string, string> = {
  pending: "bg-accent/15 text-accent-foreground",
  "in-review": "bg-primary/10 text-primary",
  processing: "bg-primary/10 text-primary",
  approved: "bg-secondary/15 text-secondary",
  rejected: "bg-destructive/10 text-destructive",
};

const KANBAN_COLUMNS = [
  { id: "pending", label: "Pending", color: "bg-accent" },
  { id: "in-review", label: "In Review", color: "bg-primary" },
  { id: "processing", label: "Processing", color: "bg-primary" },
  { id: "approved", label: "Approved", color: "bg-secondary" },
  { id: "rejected", label: "Rejected", color: "bg-destructive" },
];

const VISA_TYPES = ["Tourist Visa", "Business Visa", "Student Visa", "Work Visa", "Transit Visa"];

const AdminVisaApplications = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", type: "Tourist Visa", details: "", status: "pending" });

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setApps(data || []);
    setLoading(false);
  };

  const handleUpdateApp = async () => {
    if (!editingApp) return;
    const updates: any = { status: editStatus };
    if (editNotes.trim()) updates.details = editNotes;
    const { error } = await supabase.from("applications").update(updates).eq("id", editingApp.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Application Updated" });
    setEditDialogOpen(false);
    fetchApps();
  };

  const handleCreate = async () => {
    if (!createForm.title) { toast({ title: "Please enter a title", variant: "destructive" }); return; }
    const { error } = await supabase.from("applications").insert({
      title: createForm.title, type: createForm.type, details: createForm.details || null,
      status: createForm.status, user_id: user?.id || "",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Application Created" }); setCreateDialogOpen(false);
    setCreateForm({ title: "", type: "Tourist Visa", details: "", status: "pending" }); fetchApps();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Application Deleted" }); fetchApps();
  };
  const handleKanbanMove = async (itemId: string, newStatus: string) => {
    const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", itemId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setApps(prev => prev.map(a => a.id === itemId ? { ...a, status: newStatus } : a));
    toast({ title: "Status Updated", description: `Application moved to ${newStatus.replace(/-/g, " ")}` });
  };

  const appTypes = [...new Set(apps.map(a => a.type))];

  const filtered = apps.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Visa & Immigration Applications</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage all visa applications and immigration cases.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1.5 h-8 text-[12px]" onClick={() => { setCreateForm({ title: "", type: "Tourist Visa", details: "", status: "pending" }); setCreateDialogOpen(true); }}>
              <Plus className="w-3.5 h-3.5" /> Add Application
            </Button>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border/60">
              <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-8 gap-1.5 text-[12px]"
              onClick={() => setViewMode("table")}
            >
              <List className="w-3.5 h-3.5" /> Table
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              className="h-8 gap-1.5 text-[12px]"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total", value: apps.length, icon: Globe, bg: "bg-primary/10", color: "text-primary" },
            { label: "Pending", value: apps.filter(a => a.status === "pending").length, icon: Clock, bg: "bg-accent/15", color: "text-accent" },
            { label: "In Review", value: apps.filter(a => a.status === "in-review").length, icon: FileText, bg: "bg-primary/10", color: "text-primary" },
            { label: "Approved", value: apps.filter(a => a.status === "approved").length, icon: CheckCircle, bg: "bg-secondary/15", color: "text-secondary" },
            { label: "Rejected", value: apps.filter(a => a.status === "rejected").length, icon: XCircle, bg: "bg-destructive/10", color: "text-destructive" },
          ].map(s => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card rounded-xl border border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search applications..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-9 text-[13px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {APP_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {appTypes.length > 0 && (
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px] h-9 text-[13px]"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {appTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban View */}
        {viewMode === "kanban" && (
          loading ? (
            <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-[13px]">Loading...</p></div>
          ) : (
            <KanbanBoard
              items={filtered}
              columns={KANBAN_COLUMNS}
              onMoveItem={handleKanbanMove}
              onItemClick={(item) => { setViewingApp(item); setViewDialogOpen(true); }}
            />
          )
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-[13px]">Loading...</p></div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Inbox className="w-8 h-8 text-muted-foreground/40" /></div>
                  <p className="text-[15px] font-semibold text-foreground">No applications found</p>
                  <p className="text-[13px] text-muted-foreground mt-1">Applications will appear here as users submit them.</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Title</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Type</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Submitted</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Updated</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(app => (
                        <TableRow key={app.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="text-[13px] font-semibold text-foreground">{app.title}</TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">{app.type}</TableCell>
                          <TableCell><span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg capitalize ${statusStyle[app.status] || "bg-muted"}`}>{app.status}</span></TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-[13px] text-muted-foreground">{new Date(app.updated_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setViewingApp(app); setViewDialogOpen(true); }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditingApp(app); setEditStatus(app.status); setEditNotes(app.details || ""); setEditDialogOpen(true); }}><Pencil className="w-4 h-4 mr-2" /> Update Status</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
                    <p className="text-[12px] text-muted-foreground font-medium">Showing {filtered.length} of {apps.length} applications</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {viewingApp && (
            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Title</span><span className="font-semibold">{viewingApp.title}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Type</span>{viewingApp.type}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Status</span><span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${statusStyle[viewingApp.status]}`}>{viewingApp.status}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Submitted</span>{new Date(viewingApp.created_at).toLocaleDateString()}</div>
              </div>
              {viewingApp.details && (
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Details / Notes</span><p className="text-[13px] bg-muted/30 rounded-lg p-3">{viewingApp.details}</p></div>
              )}
              <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Application ID</span><span className="font-mono text-[11px]">{viewingApp.id}</span></div>
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Update Application</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{APP_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes / Details</Label>
              <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Add notes..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleUpdateApp}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminVisaApplications;
