import { useState } from "react";
import { sendNotification } from "@/lib/notifications";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RotateCcw, DollarSign, Clock, CheckCircle, XCircle,
  MoreHorizontal, Eye, ThumbsUp, ThumbsDown, Inbox, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_CURRENCY, formatCurrency, parseCurrencyAmount } from "@/lib/currency";

interface RefundRequest {
  id: string;
  refundId: string;
  user: string;
  email: string;
  phone?: string;
  service: string;
  originalAmount: string;
  refundAmount: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  date: string;
  method: string;
  transactionId: string;
}

const STATUSES: RefundRequest["status"][] = ["pending", "approved", "rejected", "processed"];

const statusStyle: Record<string, string> = {
  pending: "bg-accent/15 text-accent-foreground border-accent/25",
  approved: "bg-secondary/15 text-secondary border-secondary/25",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  processed: "bg-primary/10 text-primary border-primary/20",
};

const MOCK_REFUNDS: RefundRequest[] = [
  { id: "1", refundId: "REF-001", user: "Ama Serwaa", email: "ama@example.com", phone: "233201111111", service: "Flight Booking", originalAmount: formatCurrency(850, DEFAULT_CURRENCY), refundAmount: formatCurrency(850, DEFAULT_CURRENCY), reason: "Flight cancelled by airline", status: "pending", date: "Mar 7, 2024", method: "Mastercard", transactionId: "#TR-00012" },
  { id: "2", refundId: "REF-002", user: "Kweku Mensah", email: "kweku@example.com", phone: "233202222222", service: "Visa Processing", originalAmount: formatCurrency(350, DEFAULT_CURRENCY), refundAmount: formatCurrency(280, DEFAULT_CURRENCY), reason: "Application withdrawn before processing", status: "approved", date: "Mar 5, 2024", method: "MoMo", transactionId: "#TR-00009" },
  { id: "3", refundId: "REF-003", user: "Efua Nyarko", email: "efua@example.com", phone: "233203333333", service: "Hotel Booking", originalAmount: formatCurrency(420, DEFAULT_CURRENCY), refundAmount: formatCurrency(420, DEFAULT_CURRENCY), reason: "Duplicate booking", status: "processed", date: "Mar 3, 2024", method: "Mastercard", transactionId: "#TR-00007" },
  { id: "4", refundId: "REF-004", user: "Kofi Asante", email: "kofi@example.com", phone: "233204444444", service: "Consultation Fee", originalAmount: formatCurrency(150, DEFAULT_CURRENCY), refundAmount: formatCurrency(150, DEFAULT_CURRENCY), reason: "Consultant no-show", status: "pending", date: "Mar 6, 2024", method: "MoMo", transactionId: "#TR-00011" },
  { id: "5", refundId: "REF-005", user: "Akua Boateng", email: "akua@example.com", phone: "233205555555", service: "Logistics Support", originalAmount: formatCurrency(1200, DEFAULT_CURRENCY), refundAmount: formatCurrency(0, DEFAULT_CURRENCY), reason: "Shipment already delivered", status: "rejected", date: "Mar 2, 2024", method: "Mastercard", transactionId: "#TR-00005" },
];

const AdminRefunds = () => {
  const { toast } = useToast();
  const [refunds, setRefunds] = useState<RefundRequest[]>(MOCK_REFUNDS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<RefundRequest | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [actioning, setActioning] = useState<RefundRequest | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");

  const openAction = (r: RefundRequest, type: "approve" | "reject") => {
    setActioning(r);
    setActionType(type);
    setActionNote("");
    setActionOpen(true);
  };

  const handleAction = () => {
    if (!actioning) return;
    const newStatus = actionType === "approve" ? "approved" : "rejected";
    setRefunds(prev => prev.map(r => r.id === actioning.id ? { ...r, status: newStatus as RefundRequest["status"] } : r));
    toast({
      title: actionType === "approve" ? "Refund Approved" : "Refund Rejected",
      description: `${actioning.refundId} — ${actioning.refundAmount} for ${actioning.user}`,
    });
    // Send email notification
    sendNotification({
      type: actionType === "approve" ? "refund_approved" : "refund_rejected",
      recipientEmail: actioning.email,
      recipientPhone: actioning.phone,
      recipientName: actioning.user,
      channel: actioning.phone ? "both" : "email",
      data: { refundId: actioning.refundId, amount: actioning.refundAmount, service: actioning.service, method: actioning.method, reason: actionNote },
    });
    setActionOpen(false);
  };

  const handleProcess = (r: RefundRequest) => {
    setRefunds(prev => prev.map(ref => ref.id === r.id ? { ...ref, status: "processed" } : ref));
    toast({ title: "Refund Processed", description: `${r.refundAmount} refunded to ${r.user} via ${r.method}` });
    sendNotification({
      type: "refund_processed",
      recipientEmail: r.email,
      recipientPhone: r.phone,
      recipientName: r.user,
      channel: r.phone ? "both" : "email",
      data: { refundId: r.refundId, amount: r.refundAmount, method: r.method },
    });
  };

  const filtered = refunds.filter(r => statusFilter === "all" || r.status === statusFilter);

  const totalPending = refunds.filter(r => r.status === "pending").reduce((sum, r) => sum + parseCurrencyAmount(r.refundAmount), 0);
  const totalProcessed = refunds.filter(r => r.status === "processed").reduce((sum, r) => sum + parseCurrencyAmount(r.refundAmount), 0);
  const pendingCount = refunds.filter(r => r.status === "pending").length;
  const processedCount = refunds.filter(r => r.status === "processed").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Refund Processing</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Review, approve, and process customer refund requests.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending Refunds", value: pendingCount, sub: formatCurrency(totalPending, DEFAULT_CURRENCY), icon: Clock, color: "text-accent" },
            { label: "Approved", value: refunds.filter(r => r.status === "approved").length, sub: "Awaiting processing", icon: ThumbsUp, color: "text-secondary" },
            { label: "Processed", value: processedCount, sub: formatCurrency(totalProcessed, DEFAULT_CURRENCY), icon: CheckCircle, color: "text-primary" },
            { label: "Rejected", value: refunds.filter(r => r.status === "rejected").length, sub: "Denied requests", icon: XCircle, color: "text-destructive" },
          ].map(s => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
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
                  {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-[12px] text-muted-foreground font-medium ml-auto">{filtered.length} requests</span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Inbox className="w-8 h-8 text-muted-foreground/40" /></div>
                <p className="text-[15px] font-semibold text-foreground">No refund requests</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Refund ID</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">User</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Service</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Amount</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-[12px] text-primary font-bold">{r.refundId}</TableCell>
                      <TableCell>
                        <div>
                          <span className="font-semibold text-[13px] text-foreground block">{r.user}</span>
                          <span className="text-[11px] text-muted-foreground">{r.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{r.service}</TableCell>
                      <TableCell>
                        <div>
                          <span className="text-[13px] font-bold text-foreground block">{r.refundAmount}</span>
                          <span className="text-[11px] text-muted-foreground">of {r.originalAmount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{r.date}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold border capitalize ${statusStyle[r.status]}`}>{r.status}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setViewing(r); setViewOpen(true); }}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {r.status === "pending" && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary hover:text-secondary" onClick={() => openAction(r, "approve")}>
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => openAction(r, "reject")}>
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          {r.status === "approved" && (
                            <Button size="sm" className="h-7 text-[11px] gap-1" onClick={() => handleProcess(r)}>
                              <DollarSign className="w-3 h-3" />Process
                            </Button>
                          )}
                        </div>
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
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Refund Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Refund ID</span><span className="font-mono font-bold text-primary">{viewing.refundId}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Transaction</span><span className="font-mono">{viewing.transactionId}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">User</span><span className="font-semibold">{viewing.user}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Email</span>{viewing.email}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Service</span>{viewing.service}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Method</span>{viewing.method}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Original</span>{viewing.originalAmount}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Refund</span><span className="font-bold">{viewing.refundAmount}</span></div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Reason</span>
                <p className="text-foreground bg-muted rounded-lg p-3 text-sm">{viewing.reason}</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${statusStyle[viewing.status]}`}>{viewing.status}</span>
              </div>
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Refund" : "Reject Refund"}</DialogTitle>
          </DialogHeader>
          {actioning && (
            <div className="py-2 space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Refund ID</span>
                  <span className="font-bold text-foreground">{actioning.refundId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">User</span>
                  <span className="font-semibold text-foreground">{actioning.user}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-foreground">{actioning.refundAmount}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Admin Note (optional)</Label>
                <Textarea value={actionNote} onChange={e => setActionNote(e.target.value)} rows={2} placeholder="Add a note for this decision..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant={actionType === "approve" ? "default" : "destructive"} onClick={handleAction}>
              {actionType === "approve" ? <><ThumbsUp className="w-4 h-4 mr-1.5" />Approve</> : <><ThumbsDown className="w-4 h-4 mr-1.5" />Reject</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminRefunds;
