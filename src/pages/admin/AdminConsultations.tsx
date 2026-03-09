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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search, Calendar, MoreHorizontal, Eye, Pencil, Inbox, Clock,
  CheckCircle, XCircle, Video, Users, Link2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";

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

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingConsultation, setViewingConsultation] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<any>(null);
  const [editForm, setEditForm] = useState({ status: "", notes: "", meeting_link: "" });

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
    const { error } = await supabase.from("consultations").update(updates).eq("id", editingConsultation.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Consultation Updated" });

    // Send email notification if status changed
    if (previousStatus !== editForm.status) {
      const recipientEmail = editingConsultation.email || undefined;
      const recipientPhone = editingConsultation.phone || undefined;
      const recipientName = `${editingConsultation.first_name || ""} ${editingConsultation.last_name || ""}`.trim() || "User";
      
      const notificationType = editForm.status === "cancelled" ? "consultation_cancelled" : "consultation_confirmed";
      sendNotification({
        type: notificationType,
        userId: editingConsultation.user_id,
        recipientEmail,
        recipientPhone,
        recipientName,
        channel: "both",
        data: {
          type: editingConsultation.type,
          date: editingConsultation.date,
          time: editingConsultation.time,
          duration: `${editingConsultation.duration} min`,
          previousStatus,
          newStatus: editForm.status,
        },
      });
    }

    setEditDialogOpen(false);
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
  const totalRevenue = consultations.reduce((s, c) => s + Number(c.price || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Consultation Management</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage specialist consultations, scheduling, and bookings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Consultations", value: consultations.length, icon: Calendar, bg: "bg-primary/10", color: "text-primary" },
            { label: "Upcoming", value: upcomingCount, icon: Clock, bg: "bg-accent/15", color: "text-accent" },
            { label: "Completed", value: completedCount, icon: CheckCircle, bg: "bg-secondary/15", color: "text-secondary" },
            { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: Users, bg: "bg-primary/10", color: "text-primary" },
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

        {/* Filters */}
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
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {CONSULTATION_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {consTypes.length > 0 && (
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px] h-9 text-[13px]"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {consTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
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
                      <TableRow key={c.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div>
                            <span className="font-semibold text-[13px] text-foreground block">{c.first_name} {c.last_name}</span>
                            <span className="text-[11px] text-muted-foreground">{c.email || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] capitalize">{c.type}</Badge></TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{c.date} · {c.time}</TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{c.duration} min</TableCell>
                        <TableCell className="text-[13px] font-bold text-foreground">${Number(c.price).toLocaleString()}</TableCell>
                        <TableCell><span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg capitalize ${statusStyle[c.status] || "bg-muted"}`}>{c.status}</span></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setViewingConsultation(c); setViewDialogOpen(true); }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setEditingConsultation(c); setEditForm({ status: c.status, notes: c.notes || "", meeting_link: "" }); setEditDialogOpen(true); }}><Pencil className="w-4 h-4 mr-2" /> Update</DropdownMenuItem>
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Consultation Details</DialogTitle></DialogHeader>
          {viewingConsultation && (
            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Client</span><span className="font-semibold">{viewingConsultation.first_name} {viewingConsultation.last_name}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Email</span>{viewingConsultation.email || "—"}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Phone</span>{viewingConsultation.phone || "—"}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Type</span><Badge variant="outline" className="capitalize">{viewingConsultation.type}</Badge></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Date & Time</span>{viewingConsultation.date} · {viewingConsultation.time}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Duration</span>{viewingConsultation.duration} min</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Price</span><span className="font-bold">${Number(viewingConsultation.price).toLocaleString()}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Status</span><span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${statusStyle[viewingConsultation.status]}`}>{viewingConsultation.status}</span></div>
              </div>
              {viewingConsultation.topic && (
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Topic</span>{viewingConsultation.topic}</div>
              )}
              {viewingConsultation.notes && (
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Notes</span><p className="bg-muted/30 rounded-lg p-3 text-[13px]">{viewingConsultation.notes}</p></div>
              )}
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Update Consultation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONSULTATION_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Meeting Link (optional)</Label>
              <div className="flex gap-2">
                <Input value={editForm.meeting_link} onChange={e => setEditForm(f => ({ ...f, meeting_link: e.target.value }))} placeholder="https://meet.google.com/..." className="flex-1" />
                <Button variant="outline" size="icon" onClick={() => {
                  const link = `https://meet.jit.si/aw-consultation-${editingConsultation?.id?.slice(0, 8)}`;
                  setEditForm(f => ({ ...f, meeting_link: link }));
                }}><Video className="w-4 h-4" /></Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Click the video icon to auto-generate a Jitsi meeting link.</p>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="Add consultation notes..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminConsultations;
