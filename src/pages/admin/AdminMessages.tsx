import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  Search, MessageSquare, MoreHorizontal, Eye, CheckCircle, Inbox, Mail, Trash2, Reply, Clock,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ContactMessage = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_note: string | null;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
};

const STATUSES = ["new", "read", "replied", "archived"];
const statusStyle: Record<string, string> = {
  new: "bg-accent/15 text-accent-foreground",
  read: "bg-primary/10 text-primary",
  replied: "bg-secondary/15 text-secondary",
  archived: "bg-muted text-muted-foreground",
};

import { playPing } from "@/lib/notificationSound";
import { createNotification } from "@/lib/createNotification";

const AdminMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const playPingCb = useCallback(() => {
    playPing();
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setMessages((data as ContactMessage[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel("contact_messages_admin")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        (payload) => {
          const row = payload.new as ContactMessage;
          setMessages((prev) => [row, ...prev]);
          playPingCb();
          toast({ title: "📬 New message", description: `${row.name}: ${row.subject}` });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, playPingCb, toast]);

  const updateStatus = async (id: string, status: string, note?: string) => {
    const update: { status: string; admin_note?: string } = { status };
    if (typeof note === "string") update.admin_note = note;
    const { error } = await supabase.from("contact_messages").update(update).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Updated" });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...update } : m)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Message deleted" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const openView = async (m: ContactMessage) => {
    setViewing(m);
    setAdminNote(m.admin_note || "");
    setReplyDraft(m.reply || "");
    setViewOpen(true);
    if (m.status === "new") await updateStatus(m.id, "read");
  };

  const sendReply = async () => {
    if (!viewing || !replyDraft.trim()) return;
    setSendingReply(true);
    const replyText = replyDraft.trim();
    try {
      // Persist reply
      const { error } = await supabase
        .from("contact_messages")
        .update({
          reply: replyText,
          replied_at: new Date().toISOString(),
          status: "replied",
          admin_note: adminNote || null,
        } as never)
        .eq("id", viewing.id);
      if (error) throw error;

      // Email the user via existing send-notification function (uses Resend)
      try {
        await supabase.functions.invoke("send-notification", {
          body: {
            type: "contact_reply",
            recipientEmail: viewing.email,
            recipientName: viewing.name,
            channel: "email",
            data: {
              subject: viewing.subject,
              originalMessage: viewing.message,
              reply: replyText,
            },
          },
        });
      } catch (e) {
        console.warn("Email reply failed (non-blocking):", e);
      }

      // If we know the user, also create an in-app notification
      if (viewing.user_id) {
        await createNotification({
          audience: "user",
          userId: viewing.user_id,
          title: "Reply from AtlasWave team",
          body: `Re: ${viewing.subject} — ${replyText.slice(0, 140)}`,
          type: "info",
          link: "/contact",
        });
      } else {
        await createNotification({
          audience: "admin",
          title: "Reply sent by email",
          body: `${viewing.name} will receive your reply at ${viewing.email}.`,
          type: "success",
          link: "/admin/messages",
          metadata: { contact_id: viewing.id },
        });
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === viewing.id ? { ...m, reply: replyText, status: "replied", replied_at: new Date().toISOString() } : m
        )
      );
      toast({ title: "✅ Reply sent", description: `Replied to ${viewing.name}.` });
      setViewOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not send reply";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSendingReply(false);
    }
  };

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total", value: messages.length, icon: MessageSquare, bg: "bg-primary/10", color: "text-primary" },
    { label: "New", value: messages.filter((m) => m.status === "new").length, icon: Mail, bg: "bg-accent/15", color: "text-accent" },
    { label: "Replied", value: messages.filter((m) => m.status === "replied").length, icon: CheckCircle, bg: "bg-secondary/15", color: "text-secondary" },
    { label: "Pending", value: messages.filter((m) => m.status === "read").length, icon: Clock, bg: "bg-muted text-muted-foreground", color: "text-foreground" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Contact Messages</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Messages submitted from the website Contact page.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
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
                <Input placeholder="Search name, email, subject..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
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
                <p className="text-[15px] font-semibold text-foreground">No messages</p>
                <p className="text-[13px] text-muted-foreground mt-1">Messages from the Contact form will appear here in real time.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">From</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Subject</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Received</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-[13px]">
                        <div className="font-semibold text-foreground">{m.name}</div>
                        <div className="text-muted-foreground text-[12px]">{m.email}</div>
                      </TableCell>
                      <TableCell className="text-[13px] text-foreground max-w-[280px] truncate">{m.subject}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground whitespace-nowrap">
                        {new Date(m.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg capitalize ${statusStyle[m.status] ?? ""}`}>
                          {m.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openView(m)}><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`)}>
                              <Reply className="w-4 h-4 mr-2" /> Reply by email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(m.id, "replied")}><CheckCircle className="w-4 h-4 mr-2" /> Mark replied</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(m.id, "archived")}><Inbox className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => remove(m.id)} className="text-destructive">
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

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Message details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">From</span>
                  <div className="font-semibold">{viewing.name}</div>
                  <div className="text-muted-foreground">{viewing.email}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Received</span>
                  {new Date(viewing.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Subject</span>
                <div className="font-semibold">{viewing.subject}</div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Message</span>
                <div className="rounded-lg bg-muted/40 border border-border/60 p-3 whitespace-pre-wrap leading-relaxed">{viewing.message}</div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Internal note</span>
                <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add an internal note..." rows={2} />
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5 flex items-center gap-2">
                  <Reply className="w-3 h-3" /> Reply to {viewing.name}
                </span>
                <Textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder={`Hi ${viewing.name.split(" ")[0] || "there"}, thanks for reaching out...`}
                  rows={5}
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Sent by email to <strong>{viewing.email}</strong>
                  {viewing.user_id ? " and shown in their dashboard notifications." : "."}
                </p>
              </div>
              {viewing.reply && (
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Last reply sent</span>
                  <div className="rounded-lg bg-secondary/10 border border-secondary/30 p-3 whitespace-pre-wrap text-[12px]">{viewing.reply}</div>
                  {viewing.replied_at && (
                    <p className="mt-1 text-[10px] text-muted-foreground">{new Date(viewing.replied_at).toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            {viewing && (
              <>
                <Button variant="secondary" onClick={() => updateStatus(viewing.id, viewing.status, adminNote)}>
                  Save note
                </Button>
                <Button onClick={sendReply} disabled={sendingReply || !replyDraft.trim()}>
                  <Reply className="w-4 h-4 mr-1.5" /> {sendingReply ? "Sending..." : "Send reply"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMessages;
