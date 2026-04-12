import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Pencil, Trash2, Inbox, GraduationCap, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CredentialEntry {
  id: string;
  key: string;
  value: Record<string, string>;
}

const emptyForm = { applicant_name: "", email: "", type: "ECA", institution: "", country: "", status: "pending", notes: "" };

const AdminCredentials = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<CredentialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CredentialEntry | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_content").select("id, key, value").eq("section", "credentials").order("updated_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setEntries((data || []) as CredentialEntry[]);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (e: CredentialEntry) => {
    setEditing(e);
    setForm({ applicant_name: e.value.applicant_name || "", email: e.value.email || "", type: e.value.type || "ECA", institution: e.value.institution || "", country: e.value.country || "", status: e.value.status || "pending", notes: e.value.notes || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.applicant_name.trim()) { toast({ title: "Applicant name is required", variant: "destructive" }); return; }
    setSaving(true);
    const value = { ...form };
    if (editing) {
      const { error } = await supabase.from("site_content").update({ value, updated_at: new Date().toISOString() }).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Entry updated" });
    } else {
      const { error } = await supabase.from("site_content").insert({ section: "credentials", key: `cred_${Date.now()}`, value });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Entry created" });
    }
    setSaving(false); setDialogOpen(false); fetchEntries();
  };

  const handleDelete = async (e: CredentialEntry) => {
    const { error } = await supabase.from("site_content").delete().eq("id", e.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Entry deleted" }); fetchEntries(); }
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-secondary/15 text-secondary";
    if (s === "in-progress") return "bg-primary/10 text-primary";
    return "bg-accent/15 text-accent";
  };

  const filtered = entries.filter(e => (e.value.applicant_name || "").toLowerCase().includes(search.toLowerCase()) || (e.value.institution || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Credential Evaluations</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage ECA, nursing, and academic credential evaluation requests.</p>
          </div>
          <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1.5" /> New Request</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Total Requests", value: entries.length, icon: GraduationCap, bg: "bg-primary/10", color: "text-primary" },
            { label: "Completed", value: entries.filter(e => e.value.status === "completed").length, icon: FileText, bg: "bg-secondary/15", color: "text-secondary" },
            { label: "Pending", value: entries.filter(e => e.value.status === "pending").length, icon: GraduationCap, bg: "bg-accent/15", color: "text-accent" },
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
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or institution..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
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
                <p className="text-[15px] font-semibold text-foreground">No credential evaluations</p>
                <Button className="mt-4" size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1.5" /> Add Request</Button>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Applicant</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Institution</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Country</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map(e => (
                    <TableRow key={e.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div><span className="font-semibold text-[13px]">{e.value.applicant_name}</span><br/><span className="text-[11px] text-muted-foreground">{e.value.email}</span></div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{e.value.type}</Badge></TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{e.value.institution || "—"}</TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{e.value.country || "—"}</TableCell>
                      <TableCell><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${statusColor(e.value.status)}`}>{e.value.status}</span></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(e)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(e)}><Trash2 className="w-3.5 h-3.5" /></Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader><DialogTitle>{editing ? "Edit Request" : "New Credential Evaluation"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Applicant Name *</Label><Input value={form.applicant_name} onChange={e => setForm(f => ({ ...f, applicant_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Evaluation Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["ECA", "Nursing (CGFNS)", "Academic", "Professional"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Institution</Label><Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCredentials;
