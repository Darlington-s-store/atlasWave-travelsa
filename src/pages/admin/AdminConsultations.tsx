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
import { Badge } from "@/components/ui/badge";
import {
  Search, Calendar, MoreHorizontal, Eye, Pencil, Inbox, Clock,
  CheckCircle, XCircle, Video, Users, Trash2, ArrowLeft, Phone, Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

const CONSULTATION_STATUSES = ["upcoming", "completed", "cancelled"];
const statusStyle: Record<string, string> = {
  upcoming: "bg-accent/15 text-accent-foreground",
  completed: "bg-secondary/15 text-secondary",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminConsultations = () => {
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<any>(null);
  const [editForm, setEditForm] = useState({ status: "", notes: "", meeting_link: "", date: "", time: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingConsultation, setDeletingConsultation] = useState<any>(null);

  useEffect(() => { fetchConsultations(); }, []);

  const fetchConsultations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("consultations").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setConsultations(data || []);
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editingConsultation) return;
    const previousStatus = editingConsultation.status;
    const updates: any = { status: editForm.status };
    if (editForm.notes.trim()) updates.notes = editForm.notes;
    if (editForm.date.trim()) updates.date = editForm.date;
    if (editForm.time.trim()) updates.time = editForm.time;
    const { error } = await supabase.from("consultations").update(updates).eq("id", editingConsultation.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Consultation Updated" });

    if (previousStatus !== editForm.status) {
      const recipientEmail = editingConsultation.email || undefined;
      const recipientPhone = editingConsultation.phone || undefined;
      const recipientName = `${editingConsultation.first_name || ""} ${editingConsultation.last_name || ""}`.trim() || "User";
      const notificationType = editForm.status === "cancelled" ? "consultation_cancelled" : "consultation_confirmed";
      sendNotification({
        type: notificationType,
        userId: editingConsultation.user_id,
        recipientEmail, recipientPhone, recipientName,
        channel: "both",
        data: {
          type: editingConsultation.type, date: editForm.date || editingConsultation.date,
          time: editForm.time || editingConsultation.time, duration: `${editingConsultation.duration} min`,
          previousStatus, newStatus: editForm.status,
        },
      });
    }

    setEditDialogOpen(false);
    if (selectedConsultation?.id === editingConsultation.id) {
      setSelectedConsultation({ ...editingConsultation, ...updates });
    }
    fetchConsultations();
  };

  const handleDelete = async () => {
    if (!deletingConsultation) return;
    const { error } = await supabase.from("consultations").delete().eq("id", deletingConsultation.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Consultation Deleted" });
    setDeleteDialogOpen(false);
    setDeletingConsultation(null);
    if (selectedConsultation?.id === deletingConsultation.id) setSelectedConsultation(null);
    fetchConsultations();
  };

  const consTypes = [...new Set(consultations.map(c => c.type))];

  const filtered = consultations.filter(c => {
    const matchesSearch = (c.first_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.last_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const upcomingCount = consultations.filter(c => c.status === "upcoming").length;
  const completedCount = consultations.filter(c => c.status === "completed").length;
  const cancelledCount = consultations.filter(c => c.status === "cancelled").length;
  const totalRevenue = consultations.reduce((s, c) => s + Number(c.price || 0), 0);

  // Detail view
  if (selectedConsultation) {
    const c = selectedConsultation;
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedConsultation(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Consultation Details</h2>
              <p className="text-muted-foreground text-[13px]">ID: {c.id.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Info */}
            <Card className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-foreground text-[15px]">Client Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">First Name</p><p className="text-[14px] font-semibold">{c.first_name || "—"}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Last Name</p><p className="text-[14px] font-semibold">{c.last_name || "—"}</p></div>
                  <div className="flex items-start gap-2"><Mail className="w-4 h-4 text-muted-foreground mt-0.5" /><div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Email</p><p className="text-[14px]">{c.email || "—"}</p></div></div>
                  <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-muted-foreground mt-0.5" /><div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Phone</p><p className="text-[14px]">{c.phone || "—"}</p></div></div>
                </div>
              </CardContent>
            </Card>

            {/* Consultation Info */}
            <Card className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-foreground text-[15px]">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Type</p><Badge variant="outline" className="capitalize mt-1">{c.type}</Badge></div>
                  <div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Status</p><span className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-1 rounded-lg capitalize ${statusStyle[c.status] || "bg-muted"}`}>{c.status}</span></div>
                  <div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Date</p><p className="text-[14px] font-semibold">{c.date}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Time</p><p className="text-[14px] font-semibold">{c.time}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Duration</p><p className="text-[14px] font-semibold">{c.duration} minutes</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Price</p><p className="text-[14px] font-bold">{formatCurrency(Number(c.price), DEFAULT_CURRENCY)}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Timezone</p><p className="text-[14px]">{c.timezone}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Created</p><p className="text-[14px]">{new Date(c.created_at).toLocaleString()}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Topic & Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {c.topic && (
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground text-[15px] mb-2">Topic</h3>
                  <p className="text-[13px] text-muted-foreground bg-muted/30 rounded-lg p-4">{c.topic}</p>
                </CardContent>
              </Card>
            )}
            {c.notes && (
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground text-[15px] mb-2">Notes</h3>
                  <p className="text-[13px] text-muted-foreground bg-muted/30 rounded-lg p-4">{c.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={() => { setEditingConsultation(c); setEditForm({ status: c.status, notes: c.notes || "", meeting_link: "", date: c.date, time: c.time }); setEditDialogOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Edit Consultation
            </Button>
            <Button variant="destructive" onClick={() => { setDeletingConsultation(c); setDeleteDialogOpen(true); }}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Update Consultation</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Status</Label><Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONSULTATION_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Time</Label><Input type="time" value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Meeting Link</Label>
                  <div className="flex gap-2">
                    <Input value={editForm.meeting_link} onChange={e => setEditForm(f => ({ ...f, meeting_link: e.target.value }))} placeholder="https://meet..." className="flex-1" />
                    <Button variant="outline" size="icon" onClick={() => setEditForm(f => ({ ...f, meeting_link: `https://meet.jit.si/aw-consultation-${editingConsultation?.id?.slice(0, 8)}` }))}><Video className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="Add consultation notes..." rows={3} /></div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleUpdate}>Save Changes</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader><DialogTitle>Delete Consultation</DialogTitle></DialogHeader>
            <p className="text-[13px] text-muted-foreground py-2">Are you sure you want to delete this consultation? This action cannot be undone.</p>
            <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    );
  }

  // List view
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Consultation Management</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage specialist consultations, scheduling, and bookings.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: consultations.length, icon: Calendar, bg: "bg-primary/10", color: "text-primary" },
            { label: "Upcoming", value: upcomingCount, icon: Clock, bg: "bg-accent/15", color: "text-accent" },
            { label: "Completed", value: completedCount, icon: CheckCircle, bg: "bg-secondary/15", color: "text-secondary" },
            { label: "Revenue", value: formatCurrency(totalRevenue, DEFAULT_CURRENCY), icon: Users, bg: "bg-primary/10", color: "text-primary" },
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
                <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-9 text-[13px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Statuses</SelectItem>{CONSULTATION_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
                {consTypes.length > 0 && (
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px] h-9 text-[13px]"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Types</SelectItem>{consTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
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
                <p className="text-[15px] font-semibold text-foreground">No consultations found</p>
                <p className="text-[13px] text-muted-foreground mt-1">Consultations will appear here as users book them.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Client</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Type</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Date & Time</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Duration</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Price</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(c => (
                      <TableRow key={c.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedConsultation(c)}>
                        <TableCell>
                          <div>
                            <span className="font-semibold text-[13px] text-foreground block">{c.first_name} {c.last_name}</span>
                            <span className="text-[11px] text-muted-foreground">{c.email || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] capitalize">{c.type}</Badge></TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{c.date} · {c.time}</TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{c.duration} min</TableCell>
                        <TableCell className="text-[13px] font-bold text-foreground">{formatCurrency(Number(c.price), DEFAULT_CURRENCY)}</TableCell>
                        <TableCell><span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg capitalize ${statusStyle[c.status] || "bg-muted"}`}>{c.status}</span></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedConsultation(c); }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingConsultation(c); setEditForm({ status: c.status, notes: c.notes || "", meeting_link: "", date: c.date, time: c.time }); setEditDialogOpen(true); }}><Pencil className="w-4 h-4 mr-2" /> Update</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeletingConsultation(c); setDeleteDialogOpen(true); }}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
                  <p className="text-[12px] text-muted-foreground font-medium">Showing {filtered.length} of {consultations.length} consultations</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Update Consultation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Status</Label><Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONSULTATION_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Time</Label><Input type="time" value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Meeting Link</Label>
                <div className="flex gap-2">
                  <Input value={editForm.meeting_link} onChange={e => setEditForm(f => ({ ...f, meeting_link: e.target.value }))} placeholder="https://meet..." className="flex-1" />
                  <Button variant="outline" size="icon" onClick={() => setEditForm(f => ({ ...f, meeting_link: `https://meet.jit.si/aw-consultation-${editingConsultation?.id?.slice(0, 8)}` }))}><Video className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="Add consultation notes..." rows={3} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleUpdate}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Consultation</DialogTitle></DialogHeader>
          <p className="text-[13px] text-muted-foreground py-2">Are you sure you want to delete this consultation? This action cannot be undone.</p>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminConsultations;
