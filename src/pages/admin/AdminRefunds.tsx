import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Inbox,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react";

import { sendNotification } from "@/lib/notifications";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency";

interface RefundRequest {
  id: string;
  refund_id: string;
  user_name: string;
  email: string;
  phone: string | null;
  service: string;
  original_amount: number;
  refund_amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  method: string;
  transaction_reference: string | null;
  admin_note: string | null;
  requested_at: string;
}

const STATUSES: RefundRequest["status"][] = ["pending", "approved", "rejected", "processed"];

const statusStyle: Record<string, string> = {
  pending: "bg-accent/15 text-accent-foreground border-accent/25",
  approved: "bg-secondary/15 text-secondary border-secondary/25",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  processed: "bg-primary/10 text-primary border-primary/20",
};

const AdminRefunds = () => {
  const { toast } = useToast();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<RefundRequest | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [actioning, setActioning] = useState<RefundRequest | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRefunds = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("refund_requests" as never)
        .select("*")
        .order("requested_at", { ascending: false });

      setRefunds(
        ((data || []) as any[]).map((item) => ({
          ...item,
          original_amount: Number(item.original_amount),
          refund_amount: Number(item.refund_amount),
        })),
      );
      setLoading(false);
    };

    loadRefunds();
  }, []);

  const openAction = (request: RefundRequest, type: "approve" | "reject") => {
    setActioning(request);
    setActionType(type);
    setActionNote("");
    setActionOpen(true);
  };

  const updateRefund = async (id: string, updates: Record<string, unknown>) => {
    await (supabase as any).from("refund_requests" as never).update(updates).eq("id", id);
    setRefunds((prev) =>
      prev.map((refund) => (refund.id === id ? { ...refund, ...(updates as Partial<RefundRequest>) } : refund)),
    );
  };

  const handleAction = async () => {
    if (!actioning) return;
    const newStatus = actionType === "approve" ? "approved" : "rejected";

    await updateRefund(actioning.id, {
      status: newStatus,
      admin_note: actionNote || null,
      updated_at: new Date().toISOString(),
    });

    toast({
      title: actionType === "approve" ? "Refund Approved" : "Refund Rejected",
      description: `${actioning.refund_id} - ${formatCurrency(actioning.refund_amount, DEFAULT_CURRENCY)} for ${actioning.user_name}`,
    });

    sendNotification({
      type: actionType === "approve" ? "refund_approved" : "refund_rejected",
      recipientEmail: actioning.email,
      recipientPhone: actioning.phone || undefined,
      recipientName: actioning.user_name,
      channel: actioning.phone ? "both" : "email",
      data: {
        refundId: actioning.refund_id,
        amount: formatCurrency(actioning.refund_amount, DEFAULT_CURRENCY),
        service: actioning.service,
        method: actioning.method,
        reason: actionNote,
      },
    });

    setActionOpen(false);
  };

  const handleProcess = async (request: RefundRequest) => {
    await updateRefund(request.id, {
      status: "processed",
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    toast({
      title: "Refund Processed",
      description: `${formatCurrency(request.refund_amount, DEFAULT_CURRENCY)} refunded to ${request.user_name} via ${request.method}`,
    });

    sendNotification({
      type: "refund_processed",
      recipientEmail: request.email,
      recipientPhone: request.phone || undefined,
      recipientName: request.user_name,
      channel: request.phone ? "both" : "email",
      data: {
        refundId: request.refund_id,
        amount: formatCurrency(request.refund_amount, DEFAULT_CURRENCY),
        method: request.method,
      },
    });
  };

  const filtered = useMemo(
    () => refunds.filter((refund) => statusFilter === "all" || refund.status === statusFilter),
    [refunds, statusFilter],
  );

  const totalPending = refunds
    .filter((refund) => refund.status === "pending")
    .reduce((sum, refund) => sum + refund.refund_amount, 0);
  const totalProcessed = refunds
    .filter((refund) => refund.status === "processed")
    .reduce((sum, refund) => sum + refund.refund_amount, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold tracking-tight text-foreground">
            Refund Processing
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Review, approve, and process customer refund requests.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Pending Refunds",
              value: refunds.filter((refund) => refund.status === "pending").length,
              sub: formatCurrency(totalPending, DEFAULT_CURRENCY),
              icon: Clock,
              color: "text-accent",
            },
            {
              label: "Approved",
              value: refunds.filter((refund) => refund.status === "approved").length,
              sub: "Awaiting processing",
              icon: ThumbsUp,
              color: "text-secondary",
            },
            {
              label: "Processed",
              value: refunds.filter((refund) => refund.status === "processed").length,
              sub: formatCurrency(totalProcessed, DEFAULT_CURRENCY),
              icon: CheckCircle,
              color: "text-primary",
            },
            {
              label: "Rejected",
              value: refunds.filter((refund) => refund.status === "rejected").length,
              sub: "Denied requests",
              icon: XCircle,
              color: "text-destructive",
            },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-xl border border-border/60 shadow-card">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden rounded-xl border border-border/60 shadow-card">
          <CardContent className="p-0">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[140px] text-[13px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="ml-auto text-[12px] font-medium text-muted-foreground">
                {filtered.length} requests
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Loading refund requests...</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Inbox className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-[15px] font-semibold text-foreground">No refund requests</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">Refund ID</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">User</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">Service</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">Amount</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-[12px] font-bold text-primary">
                        {request.refund_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="block text-[13px] font-semibold text-foreground">
                            {request.user_name}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{request.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {request.service}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="block text-[13px] font-bold text-foreground">
                            {formatCurrency(request.refund_amount, DEFAULT_CURRENCY)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            of {formatCurrency(request.original_amount, DEFAULT_CURRENCY)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-lg border px-2 py-1 text-[11px] font-bold capitalize ${statusStyle[request.status]}`}>
                          {request.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setViewing(request); setViewOpen(true); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {request.status === "pending" ? (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary hover:text-secondary" onClick={() => openAction(request, "approve")}>
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => openAction(request, "reject")}>
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : null}
                          {request.status === "approved" ? (
                            <Button size="sm" className="h-7 gap-1 text-[11px]" onClick={() => handleProcess(request)}>
                              <DollarSign className="h-3 w-3" />
                              Process
                            </Button>
                          ) : null}
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

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Refund Details</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Refund ID</span><span className="font-mono font-bold text-primary">{viewing.refund_id}</span></div>
                <div><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Transaction</span><span className="font-mono">{viewing.transaction_reference || "N/A"}</span></div>
                <div><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">User</span><span className="font-semibold">{viewing.user_name}</span></div>
                <div><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email</span>{viewing.email}</div>
                <div><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Service</span>{viewing.service}</div>
                <div><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Method</span>{viewing.method}</div>
                <div><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Original</span>{formatCurrency(viewing.original_amount, DEFAULT_CURRENCY)}</div>
                <div><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Refund</span><span className="font-bold">{formatCurrency(viewing.refund_amount, DEFAULT_CURRENCY)}</span></div>
              </div>
              <div>
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Reason</span>
                <p className="rounded-lg bg-muted p-3 text-sm text-foreground">{viewing.reason}</p>
              </div>
              {viewing.admin_note ? (
                <div>
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Admin Note</span>
                  <p className="rounded-lg bg-muted p-3 text-sm text-foreground">{viewing.admin_note}</p>
                </div>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve Refund" : "Reject Refund"}</DialogTitle>
          </DialogHeader>
          {actioning ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2 rounded-lg bg-muted p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Refund ID</span>
                  <span className="font-bold text-foreground">{actioning.refund_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">User</span>
                  <span className="font-semibold text-foreground">{actioning.user_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(actioning.refund_amount, DEFAULT_CURRENCY)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Admin Note (optional)</Label>
                <Textarea value={actionNote} onChange={(event) => setActionNote(event.target.value)} rows={2} placeholder="Add a note for this decision..." />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant={actionType === "approve" ? "default" : "destructive"} onClick={handleAction}>
              {actionType === "approve" ? (
                <>
                  <ThumbsUp className="mr-1.5 h-4 w-4" />
                  Approve
                </>
              ) : (
                <>
                  <ThumbsDown className="mr-1.5 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminRefunds;
