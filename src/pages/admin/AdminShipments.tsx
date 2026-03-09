import { useState, useEffect } from "react";
import { sendNotification } from "@/lib/notifications";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package, Truck, Ship, Plane, MapPin, Plus, MoreHorizontal,
  Eye, Pencil, Trash2, Inbox, CheckCircle, Clock, AlertTriangle, XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const STATUSES = ["processing", "in-transit", "customs", "delivered", "delayed"];

const statusStyle: Record<string, { bg: string; icon: typeof CheckCircle }> = {
  processing: { bg: "bg-primary/10 text-primary border-primary/20", icon: Clock },
  "in-transit": { bg: "bg-accent/15 text-accent-foreground border-accent/25", icon: Truck },
  customs: { bg: "bg-muted text-muted-foreground border-border", icon: AlertTriangle },
  delivered: { bg: "bg-secondary/15 text-secondary border-secondary/25", icon: CheckCircle },
  delayed: { bg: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const AdminShipments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<any | null>(null);

  const [form, setForm] = useState({
    tracking_number: "", origin: "", destination: "",
    status: "processing", weight: "", progress: "0", eta: "",
  });

  useEffect(() => { fetchShipments(); }, []);

  const fetchShipments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("shipments").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setShipments(data || []);
    setLoading(false);
  };

  const resetForm = () => setForm({ tracking_number: "", origin: "", destination: "", status: "processing", weight: "", progress: "0", eta: "" });

  const openCreate = () => { resetForm(); setEditing(null); setDialogOpen(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      tracking_number: s.tracking_number, origin: s.origin, destination: s.destination,
      status: s.status, weight: s.weight || "", progress: String(s.progress), eta: s.eta || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.tracking_number.trim() || !form.origin.trim() || !form.destination.trim()) {
      toast({ title: "Tracking number, origin, and destination are required", variant: "destructive" });
      return;
    }
    const data = {
      tracking_number: form.tracking_number, origin: form.origin, destination: form.destination,
      status: form.status, weight: form.weight || null, progress: parseInt(form.progress) || 0, eta: form.eta || null,
    };
    if (editing) {
      const previousStatus = editing.status;
      const { error } = await supabase.from("shipments").update(data).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Shipment updated" });

      // Send email notification if status changed
      if (previousStatus !== data.status) {
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", editing.user_id).single();
        sendNotification({
          type: "shipment_update",
          recipientEmail: `user-${editing.user_id.slice(0, 8)}@atlaswave.com`,
          recipientName: profile?.full_name || "User",
          data: {
            trackingId: data.tracking_number,
            status: data.status,
            origin: data.origin,
            destination: data.destination,
            previousStatus,
          },
        });
      }
    } else {
      const { error } = await supabase.from("shipments").insert({ ...data, user_id: user?.id || "" });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Shipment created" });
    }
    setDialogOpen(false);
    fetchShipments();
  };

  const handleDelete = async () => {
    if (deleting) {
      const { error } = await supabase.from("shipments").delete().eq("id", deleting.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Shipment deleted" });
    }
    setDeleteOpen(false);
    setDeleting(null);
    fetchShipments();
  };

  const filtered = shipments.filter(s => statusFilter === "all" || s.status === statusFilter);
  const counts = {
    total: shipments.length,
    transit: shipments.filter(s => s.status === "in-transit").length,
    delivered: shipments.filter(s => s.status === "delivered").length,
    delayed: shipments.filter(s => s.status === "delayed").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Shipment Management</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Monitor and manage all shipments.</p>
          </div>
          <Button size="sm" className="gap-1.5 h-9 text-[13px] font-semibold rounded-lg px-4" onClick={openCreate}>
            <Plus className="w-4 h-4" /> New Shipment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Shipments", value: counts.total, icon: Package, color: "text-primary" },
            { label: "In Transit", value: counts.transit, icon: Truck, color: "text-accent" },
            { label: "Delivered", value: counts.delivered, icon: CheckCircle, color: "text-secondary" },
            { label: "Delayed", value: counts.delayed, icon: AlertTriangle, color: "text-destructive" },
          ].map(s => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-[13px]"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace("-", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-[12px] text-muted-foreground font-medium ml-auto">{filtered.length} shipments</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-[13px]">Loading...</p></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Inbox className="w-8 h-8 text-muted-foreground/40" /></div>
                <p className="text-[15px] font-semibold text-foreground">No shipments found</p>
                <p className="text-[13px] text-muted-foreground mt-1">Click "New Shipment" to create one.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Tracking</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Route</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Weight</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Progress</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(s => {
                    const st = statusStyle[s.status] || statusStyle["processing"];
                    return (
                      <TableRow key={s.id} className="hover:bg-muted/20">
                        <TableCell className="font-mono text-[12px] text-primary font-bold">{s.tracking_number}</TableCell>
                        <TableCell>
                          <div className="text-[12px]">
                            <span className="text-foreground font-medium">{s.origin}</span>
                            <MapPin className="w-3 h-3 text-muted-foreground inline mx-1" />
                            <span className="text-muted-foreground">{s.destination}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{s.weight || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={s.progress} className="h-1.5 w-16" />
                            <span className="text-[11px] text-muted-foreground">{s.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border capitalize ${st.bg}`}>
                            <st.icon className="w-3 h-3" />{s.status.replace("-", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setViewing(s); setViewOpen(true); }}><Eye className="w-4 h-4 mr-2" />View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(s)}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => { setDeleting(s); setDeleteOpen(true); }}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? "Edit Shipment" : "New Shipment"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tracking Number *</Label>
              <Input value={form.tracking_number} onChange={e => setForm(f => ({ ...f, tracking_number: e.target.value }))} placeholder="AWL-2024-001" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Origin *</Label><Input value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} placeholder="Accra, Ghana" /></div>
              <div className="space-y-2"><Label>Destination *</Label><Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="London, UK" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace("-", " ")}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label>Weight</Label>
                <Input value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="25 kg" />
              </div>
              <div className="space-y-2">
                <Label>Progress (%)</Label>
                <Input type="number" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ETA</Label>
              <Input value={form.eta} onChange={e => setForm(f => ({ ...f, eta: e.target.value }))} placeholder="Mar 15, 2024" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Shipment Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Tracking</span><span className="font-mono font-bold text-primary">{viewing.tracking_number}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Status</span><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border capitalize ${statusStyle[viewing.status]?.bg || ""}`}>{viewing.status}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Origin</span>{viewing.origin}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Destination</span>{viewing.destination}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Weight</span>{viewing.weight || "—"}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">ETA</span>{viewing.eta || "—"}</div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Progress</span>
                  <div className="flex items-center gap-2">
                    <Progress value={viewing.progress} className="h-2 flex-1" />
                    <span className="text-sm font-bold">{viewing.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Shipment</DialogTitle></DialogHeader>
          <p className="text-[13px] text-muted-foreground py-2">Are you sure you want to delete shipment <strong className="text-foreground">{deleting?.tracking_number}</strong>? This cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminShipments;
