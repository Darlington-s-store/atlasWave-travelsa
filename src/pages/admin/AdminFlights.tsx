import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plane, MoreHorizontal, Eye, Pencil, Inbox, Clock, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { notifyStatusChange } from "@/lib/notifyStatusChange";
import { useAuth } from "@/contexts/AuthContext";

const STATUSES = ["pending", "confirmed", "cancelled"];
const statusStyle: Record<string, string> = {
  pending: "bg-accent/15 text-accent-foreground",
  confirmed: "bg-secondary/15 text-secondary",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminFlights = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [form, setForm] = useState({ route: "", date: "", provider: "", status: "pending" });

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("bookings").select("*").eq("type", "flight").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setBookings(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const booking = bookings.find(b => b.id === id);
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Status Updated" });
    if (booking) {
      notifyStatusChange({
        type: "booking_status_update",
        userId: booking.user_id,
        data: { route: booking.route, date: booking.date, provider: booking.provider || "", bookingType: "flight", newStatus: status },
      });
    }
    fetchBookings();
  };

  const handleCreate = async () => {
    if (!form.route || !form.date) { toast({ title: "Please fill required fields", variant: "destructive" }); return; }
    const { error } = await supabase.from("bookings").insert({
      route: form.route, date: form.date, provider: form.provider || null,
      status: form.status, type: "flight", user_id: user?.id || "",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Flight Booking Created" }); setCreateDialogOpen(false);
    setForm({ route: "", date: "", provider: "", status: "pending" }); fetchBookings();
  };

  const handleEdit = async () => {
    if (!editingBooking) return;
    const { error } = await supabase.from("bookings").update({
      route: form.route, date: form.date, provider: form.provider || null, status: form.status,
    }).eq("id", editingBooking.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Booking Updated" }); setEditDialogOpen(false); fetchBookings();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Booking Deleted" }); fetchBookings();
  };

  const filtered = bookings.filter(b => {
    const matchesSearch = b.route.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statCards = [
    { label: "Total Flights", value: bookings.length, icon: Plane, bg: "bg-primary/10", color: "text-primary" },
    { label: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length, icon: CheckCircle, bg: "bg-secondary/15", color: "text-secondary" },
    { label: "Pending", value: bookings.filter(b => b.status === "pending").length, icon: Clock, bg: "bg-accent/15", color: "text-accent" },
    { label: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length, icon: XCircle, bg: "bg-destructive/10", color: "text-destructive" },
  ];

  const bookingFormFields = (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label>Route *</Label>
        <Input placeholder="e.g. Accra → London" value={form.route} onChange={e => setForm(f => ({ ...f, route: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Provider / Airline</Label>
        <Input placeholder="e.g. Emirates" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Flight Booking Management</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage all flight bookings across the platform.</p>
          </div>
          <Button size="sm" className="gap-1.5 h-9" onClick={() => { setForm({ route: "", date: "", provider: "", status: "pending" }); setCreateDialogOpen(true); }}>
            <Plus className="w-4 h-4" /> Add Booking
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => (
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by route or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-[13px]"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-[13px]">Loading...</p></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Inbox className="w-8 h-8 text-muted-foreground/40" /></div>
                <p className="text-[15px] font-semibold text-foreground">No flight bookings</p>
                <p className="text-[13px] text-muted-foreground mt-1">Click "Add Booking" to create one, or bookings will appear as users make reservations.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Route</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Provider</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(b => (
                    <TableRow key={b.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-[13px] font-semibold text-foreground">{b.route}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{b.date}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{b.provider || "—"}</TableCell>
                      <TableCell><span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg capitalize ${statusStyle[b.status] || ""}`}>{b.status}</span></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setViewingBooking(b); setViewDialogOpen(true); }}><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditingBooking(b); setForm({ route: b.route, date: b.date, provider: b.provider || "", status: b.status }); setEditDialogOpen(true); }}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(b.id, "confirmed")}><CheckCircle className="w-4 h-4 mr-2" /> Confirm</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(b.id, "cancelled")}><XCircle className="w-4 h-4 mr-2" /> Cancel</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(b.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {viewingBooking && (
            <div className="grid grid-cols-2 gap-3 py-2 text-[13px]">
              <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Route</span>{viewingBooking.route}</div>
              <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Date</span>{viewingBooking.date}</div>
              <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Provider</span>{viewingBooking.provider || "—"}</div>
              <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Status</span><span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${statusStyle[viewingBooking.status]}`}>{viewingBooking.status}</span></div>
              <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Booking ID</span><span className="font-mono text-[11px]">{viewingBooking.id}</span></div>
              <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Created</span>{new Date(viewingBooking.created_at).toLocaleDateString()}</div>
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Add Flight Booking</DialogTitle></DialogHeader>
          {bookingFormFields}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleCreate}>Create Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Edit Flight Booking</DialogTitle></DialogHeader>
          {bookingFormFields}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminFlights;
