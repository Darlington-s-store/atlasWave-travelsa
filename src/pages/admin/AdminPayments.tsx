import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Transaction {
  id: string;
  user: string;
  service: string;
  amount: string;
  date: string;
  status: string;
  method: string;
}

const SERVICES = ["Visa Processing", "Logistics Support", "Consultation Fee", "Education Visa", "Work Permit", "Flight Booking"];
const METHODS = ["Mastercard", "MoMo"];
const TX_STATUSES = ["Paid", "Pending", "Failed"];

const statusStyle: Record<string, string> = {
  Paid: "bg-secondary/15 text-secondary border border-secondary/25",
  Pending: "bg-accent/15 text-accent-foreground border border-accent/25",
  Failed: "bg-destructive/10 text-destructive border border-destructive/20",
};

let nextTxId = 1;
const generateTxId = () => `#TR-${String(nextTxId++).padStart(5, "0")}`;

const AdminPayments = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const [form, setForm] = useState({ user: "", service: SERVICES[0], amount: "", status: "Pending", method: METHODS[0] });
  const resetForm = () => setForm({ user: "", service: SERVICES[0], amount: "", status: "Pending", method: METHODS[0] });

  const openCreate = () => { resetForm(); setEditingTx(null); setDialogOpen(true); };
  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setForm({ user: tx.user, service: tx.service, amount: tx.amount.replace(/[$,]/g, ""), status: tx.status, method: tx.method });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.user.trim() || !form.amount.trim()) {
      toast({ title: "Validation Error", description: "User and amount are required.", variant: "destructive" });
      return;
    }
    const amountFormatted = `$${parseFloat(form.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    if (editingTx) {
      setTransactions(prev => prev.map(t => t.id === editingTx.id ? { ...t, user: form.user, service: form.service, amount: amountFormatted, status: form.status, method: form.method } : t));
      toast({ title: "Transaction Updated" });
    } else {
      const newTx: Transaction = { id: generateTxId(), user: form.user, service: form.service, amount: amountFormatted, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), status: form.status, method: form.method };
      setTransactions(prev => [newTx, ...prev]);
      toast({ title: "Payment Recorded", description: `${amountFormatted} from ${form.user}` });
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deletingTx) {
      setTransactions(prev => prev.filter(t => t.id !== deletingTx.id));
      toast({ title: "Transaction Deleted" });
    }
    setDeleteDialogOpen(false);
    setDeletingTx(null);
  };

  const filtered = transactions.filter(t => statusFilter === "all" || t.status === statusFilter);

  const totalRevenue = transactions.filter(t => t.status === "Paid").reduce((sum, t) => sum + parseFloat(t.amount.replace(/[$,]/g, "")), 0);
  const pendingCount = transactions.filter(t => t.status === "Pending").length;
  const paidCount = transactions.filter(t => t.status === "Paid").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Payment Monitoring</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Track and manage all transactions.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-[13px] rounded-lg">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button size="sm" className="gap-1.5 h-9 text-[13px] font-semibold rounded-lg px-4" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Record Payment
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
                  {TX_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-[12px] text-muted-foreground font-medium ml-auto">{filtered.length} transactions</span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-[15px] font-semibold text-foreground">No transactions yet</p>
                <p className="text-[13px] text-muted-foreground mt-1 max-w-[300px]">
                  {transactions.length === 0 ? "Record your first payment to get started." : "No transactions match the selected filter."}
                </p>
                {transactions.length === 0 && (
                  <Button className="mt-4 gap-1.5" onClick={openCreate}>
                    <Plus className="w-4 h-4" /> Record Payment
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">ID</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">User</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Service</TableHead>
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
                      <TableCell className="font-mono text-[12px] text-primary font-bold">{tx.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                            {tx.user.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-semibold text-[13px] text-foreground">{tx.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{tx.service}</TableCell>
                      <TableCell className="text-[13px] font-bold text-foreground">{tx.amount}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{tx.date}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusStyle[tx.status] || ""}`}>{tx.status}</span>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground font-medium">{tx.method}</TableCell>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingTx ? "Edit Transaction" : "Record Payment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>User Name *</Label>
              <Input value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service</Label>
                <Select value={form.service} onValueChange={v => setForm(f => ({ ...f, service: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount ($) *</Label>
                <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TX_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={form.method} onValueChange={v => setForm(f => ({ ...f, method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{METHODS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>{editingTx ? "Save Changes" : "Record Payment"}</Button>
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
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">ID</span><span className="font-mono font-bold text-primary">{viewingTx.id}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Date</span>{viewingTx.date}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">User</span><span className="font-semibold">{viewingTx.user}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Amount</span><span className="font-bold">{viewingTx.amount}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Service</span>{viewingTx.service}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Method</span>{viewingTx.method}</div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusStyle[viewingTx.status] || ""}`}>{viewingTx.status}</span>
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
            Are you sure you want to delete transaction <span className="font-bold text-foreground">{deletingTx?.id}</span>? This cannot be undone.
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
