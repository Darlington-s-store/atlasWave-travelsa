import { useState } from "react";
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

interface Shipment {
  id: string;
  trackingId: string;
  sender: string;
  receiver: string;
  origin: string;
  destination: string;
  carrier: string;
  mode: "air" | "sea" | "road";
  status: "processing" | "in-transit" | "customs" | "delivered" | "delayed";
  progress: number;
  date: string;
  weight: string;
}

const CARRIERS = ["DHL Express", "FedEx", "Maersk Line", "Emirates SkyCargo", "UPS", "Ghana Post"];
const MODES: Shipment["mode"][] = ["air", "sea", "road"];
const STATUSES: Shipment["status"][] = ["processing", "in-transit", "customs", "delivered", "delayed"];

const statusStyle: Record<string, { bg: string; icon: typeof CheckCircle }> = {
  processing: { bg: "bg-primary/10 text-primary border-primary/20", icon: Clock },
  "in-transit": { bg: "bg-accent/15 text-accent-foreground border-accent/25", icon: Truck },
  customs: { bg: "bg-muted text-muted-foreground border-border", icon: AlertTriangle },
  delivered: { bg: "bg-secondary/15 text-secondary border-secondary/25", icon: CheckCircle },
  delayed: { bg: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const modeIcon = { air: Plane, sea: Ship, road: Truck };

const MOCK_SHIPMENTS: Shipment[] = [
  { id: "1", trackingId: "AWL-2024-001", sender: "Daniel Mensah", receiver: "James Okonkwo", origin: "Accra, Ghana", destination: "London, UK", carrier: "DHL Express", mode: "air", status: "in-transit", progress: 65, date: "Mar 5, 2024", weight: "25 kg" },
  { id: "2", trackingId: "AWL-2024-002", sender: "Abena Osei", receiver: "Marie Dupont", origin: "Accra, Ghana", destination: "Paris, France", carrier: "Maersk Line", mode: "sea", status: "customs", progress: 80, date: "Feb 28, 2024", weight: "150 kg" },
  { id: "3", trackingId: "AWL-2024-003", sender: "Kwame Adjei", receiver: "Lisa Chen", origin: "Tema, Ghana", destination: "Toronto, Canada", carrier: "FedEx", mode: "air", status: "delivered", progress: 100, date: "Feb 20, 2024", weight: "8 kg" },
  { id: "4", trackingId: "AWL-2024-004", sender: "Grace Amponsah", receiver: "Ahmed Hassan", origin: "Accra, Ghana", destination: "Dubai, UAE", carrier: "Emirates SkyCargo", mode: "air", status: "processing", progress: 15, date: "Mar 7, 2024", weight: "45 kg" },
  { id: "5", trackingId: "AWL-2024-005", sender: "Yaw Boateng", receiver: "Sophie Mueller", origin: "Kumasi, Ghana", destination: "Berlin, Germany", carrier: "UPS", mode: "air", status: "delayed", progress: 40, date: "Mar 1, 2024", weight: "12 kg" },
];

let nextId = 10;
const genTrackingId = () => `AWL-2024-${String(nextId++).padStart(3, "0")}`;

const AdminShipments = () => {
  const { toast } = useToast();
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<Shipment | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Shipment | null>(null);

  const [form, setForm] = useState({
    sender: "", receiver: "", origin: "", destination: "",
    carrier: CARRIERS[0], mode: "air" as Shipment["mode"],
    status: "processing" as Shipment["status"], weight: "", progress: "0",
  });

  const resetForm = () => setForm({ sender: "", receiver: "", origin: "", destination: "", carrier: CARRIERS[0], mode: "air", status: "processing", weight: "", progress: "0" });

  const openCreate = () => { resetForm(); setEditing(null); setDialogOpen(true); };
  const openEdit = (s: Shipment) => {
    setEditing(s);
    setForm({ sender: s.sender, receiver: s.receiver, origin: s.origin, destination: s.destination, carrier: s.carrier, mode: s.mode, status: s.status, weight: s.weight, progress: String(s.progress) });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.sender.trim() || !form.receiver.trim()) { toast({ title: "Sender and receiver required", variant: "destructive" }); return; }
    const data = { ...form, progress: parseInt(form.progress) || 0 };
    if (editing) {
      setShipments(prev => prev.map(s => s.id === editing.id ? { ...s, ...data } : s));
      toast({ title: "Shipment updated" });
    } else {
      setShipments(prev => [{ id: String(nextId), trackingId: genTrackingId(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), ...data }, ...prev]);
      toast({ title: "Shipment created" });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleting) setShipments(prev => prev.filter(s => s.id !== deleting.id));
    toast({ title: "Shipment deleted" });
    setDeleteOpen(false);
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
            <p className="text-[13px] text-muted-foreground mt-0.5">Monitor and manage all shipments and carriers.</p>
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

        {/* Carrier Health */}
        <Card className="shadow-card rounded-xl border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-semibold">Carrier Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {CARRIERS.slice(0, 6).map(carrier => {
                const carrierShipments = shipments.filter(s => s.carrier === carrier);
                const onTime = carrierShipments.filter(s => s.status !== "delayed").length;
                const rate = carrierShipments.length > 0 ? Math.round((onTime / carrierShipments.length) * 100) : 100;
                return (
                  <div key={carrier} className="p-3 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{carrier}</p>
                      <Badge variant={rate >= 90 ? "default" : rate >= 70 ? "secondary" : "destructive"} className="text-[10px]">{rate}%</Badge>
                    </div>
                    <Progress value={rate} className="h-1.5" />
                    <p className="text-[11px] text-muted-foreground mt-1">{carrierShipments.length} shipment{carrierShipments.length !== 1 ? "s" : ""}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Inbox className="w-8 h-8 text-muted-foreground/40" /></div>
                <p className="text-[15px] font-semibold text-foreground">No shipments found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Tracking</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Route</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Carrier</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Mode</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Progress</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(s => {
                    const ModeIcon = modeIcon[s.mode];
                    const st = statusStyle[s.status];
                    return (
                      <TableRow key={s.id} className="hover:bg-muted/20">
                        <TableCell className="font-mono text-[12px] text-primary font-bold">{s.trackingId}</TableCell>
                        <TableCell>
                          <div className="text-[12px]">
                            <span className="text-foreground font-medium">{s.origin}</span>
                            <MapPin className="w-3 h-3 text-muted-foreground inline mx-1" />
                            <span className="text-muted-foreground">{s.destination}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{s.carrier}</TableCell>
                        <TableCell><ModeIcon className="w-4 h-4 text-muted-foreground" /></TableCell>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Sender *</Label><Input value={form.sender} onChange={e => setForm(f => ({ ...f, sender: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Receiver *</Label><Input value={form.receiver} onChange={e => setForm(f => ({ ...f, receiver: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Origin</Label><Input value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} placeholder="Accra, Ghana" /></div>
              <div className="space-y-2"><Label>Destination</Label><Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="London, UK" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Carrier</Label>
                <Select value={form.carrier} onValueChange={v => setForm(f => ({ ...f, carrier: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CARRIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={form.mode} onValueChange={v => setForm(f => ({ ...f, mode: v as Shipment["mode"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MODES.map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label>Weight</Label>
                <Input value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="25 kg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Shipment["status"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace("-", " ")}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label>Progress (%)</Label>
                <Input type="number" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} />
              </div>
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
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Tracking ID</span><span className="font-mono font-bold text-primary">{viewing.trackingId}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Date</span>{viewing.date}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Sender</span><span className="font-semibold">{viewing.sender}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Receiver</span><span className="font-semibold">{viewing.receiver}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Origin</span>{viewing.origin}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Destination</span>{viewing.destination}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Carrier</span>{viewing.carrier}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Weight</span>{viewing.weight}</div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Progress</span>
                <Progress value={viewing.progress} className="h-2 mb-1" />
                <span className="text-[11px] text-muted-foreground">{viewing.progress}%</span>
              </div>
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Shipment</DialogTitle></DialogHeader>
          <p className="text-[13px] text-muted-foreground py-2">Delete shipment <span className="font-bold text-foreground">{deleting?.trackingId}</span>? This cannot be undone.</p>
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
