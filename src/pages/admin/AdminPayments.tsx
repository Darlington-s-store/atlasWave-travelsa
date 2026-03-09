import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DollarSign, Clock, CheckCircle, Download, Plus, MoreHorizontal, Inbox, Eye, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendNotification } from "@/lib/notifications";

const SERVICES = ["Visa Processing", "Logistics Support", "Consultation Fee", "Education Visa", "Work Permit", "Flight Booking"];
const METHODS = ["Mastercard", "MoMo"];
const TX_STATUSES = ["completed", "pending", "failed", "refunded"];

const statusStyle: Record<string, string> = {
  completed: "bg-secondary/15 text-secondary border border-secondary/25",
  paid: "bg-secondary/15 text-secondary border border-secondary/25",
  pending: "bg-accent/15 text-accent-foreground border border-accent/25",
  failed: "bg-destructive/10 text-destructive border border-destructive/20",
  refunded: "bg-muted text-muted-foreground border border-border",
};

const AdminPayments = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [viewingTx, setViewingTx] = useState<any | null>(null);
  const [deletingTx, setDeletingTx] = useState<any | null>(null);

  const [form, setForm] = useState({ description: SERVICES[0], amount: "", status: "pending", payment_method: METHODS[0] });
  const resetForm = () => setForm({ description: SERVICES[0], amount: "", status: "pending", payment_method: METHODS[0] });

  const fetchData = async () => {
    setLoading(true);
    const [payRes, profRes] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name"),
    ]);
    setTransactions(payRes.data || []);
    const pMap: Record<string, string> = {};
    (profRes.data || []).forEach((p: any) => { pMap[p.id] = p.full_name || "Unknown"; });
    setProfiles(pMap);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (tx: any) => {
    setEditingTx(tx);
    setForm({ description: tx.description || "", amount: String(tx.amount), status: tx.status, payment_method: tx.payment_method || "Mastercard" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.amount.trim()) {
      toast({ title: "Validation Error", description: "Amount is required.", variant: "destructive" });
      return;
    }
    if (editingTx) {
      const previousStatus = editingTx.status;
      const { error } = await supabase.from("payments").update({
        description: form.description,
        amount: parseFloat(form.amount),
        status: form.status,
        payment_method: form.payment_method,
      }).eq("id", editingTx.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      if (previousStatus !== form.status) {
        await sendNotification({
          type: "payment_status_update",
          userId: editingTx.user_id,
          channel: "both",
          data: {
            reference: editingTx.reference || editingTx.id.slice(0, 8),
            amount: Number(form.amount).toFixed(2),
            currency: editingTx.currency || "USD",
            description: form.description || "Payment",
            previousStatus,
            newStatus: form.status,
          },
        });
      }
      toast({ title: "Transaction Updated" });
    }
    setDialogOpen(false);
    resetForm();
    fetchData();
  };

  const handleDelete = async () => {
    if (deletingTx) {
      await supabase.from("payments").delete().eq("id", deletingTx.id);
      toast({ title: "Transaction Deleted" });
    }
    setDeleteDialogOpen(false);
    setDeletingTx(null);
    fetchData();
  };

  const filtered = transactions.filter(t => statusFilter === "all" || t.status === statusFilter);

  const totalRevenue = transactions.filter(t => t.status === "completed" || t.status === "paid").reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingCount = transactions.filter(t => t.status === "pending").length;
  const paidCount = transactions.filter(t => t.status === "completed" || t.status === "paid").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Payment Monitoring</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Track and manage all transactions from the database.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-[13px] rounded-lg">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</p>
                <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-accent" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-foreground tracking-tight">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Pending Payments</p>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-foreground tracking-tight">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Successful</p>
                <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-foreground tracking-tight">{paidCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Table */}
        <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9 text-[13px]"><SelectValue placeholder="Status: All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Status: All</SelectItem>
                  {TX_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-[12px] text-muted-foreground font-medium ml-auto">{filtered.length} transactions</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground">Loading...</p></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-[15px] font-semibold text-foreground">No transactions found</p>
                <p className="text-[13px] text-muted-foreground mt-1 max-w-[300px]">
                  {transactions.length === 0 ? "Payments will appear here when users make them." : "No transactions match the selected filter."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Reference</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">User</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Description</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Amount</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Method</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(tx => (
                    <TableRow key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-mono text-[12px] text-primary font-bold">{tx.reference || tx.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-[13px] text-foreground">{profiles[tx.user_id] || "Unknown"}</span>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{tx.description || "Payment"}</TableCell>
                      <TableCell className="text-[13px] font-bold text-foreground">${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize ${statusStyle[tx.status] || ""}`}>{tx.status}</span>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground font-medium">{tx.payment_method || "Card"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setViewingTx(tx); setViewDialogOpen(true); }}>
                              <Eye className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(tx)}>
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { setDeletingTx(tx); setDeleteDialogOpen(true); }}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
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

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Description</Label>
              <Select value={form.description} onValueChange={v => setForm(f => ({ ...f, description: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TX_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{METHODS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Transaction Details</DialogTitle></DialogHeader>
          {viewingTx && (
            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Reference</span><span className="font-mono font-bold text-primary">{viewingTx.reference || viewingTx.id.slice(0, 8)}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Date</span>{new Date(viewingTx.created_at).toLocaleDateString()}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">User</span><span className="font-semibold">{profiles[viewingTx.user_id] || "Unknown"}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Amount</span><span className="font-bold">${Number(viewingTx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Description</span>{viewingTx.description || "Payment"}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Method</span>{viewingTx.payment_method || "Card"}</div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize ${statusStyle[viewingTx.status] || ""}`}>{viewingTx.status}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Transaction</DialogTitle></DialogHeader>
          <p className="text-[13px] text-muted-foreground py-2">
            Are you sure you want to delete this transaction? This cannot be undone.
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

export default AdminPayments;
