import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Search, Briefcase, MoreHorizontal, Eye, Pencil, Inbox, Clock,
  CheckCircle, XCircle, FileText, Globe, Calculator, LayoutGrid, List, Plus, Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import KanbanBoard from "@/components/admin/KanbanBoard";

const PROGRAMMES = ["Schengen Work Permit", "Canada LMIA", "Germany Opportunity Card", "USA NCLEX"];
const STAGES = [
  "submitted", "documents-review", "eligibility-check", "processing",
  "employer-match", "interview-prep", "decision-pending", "approved", "rejected"
];
const stageProgress: Record<string, number> = {
  submitted: 10, "documents-review": 20, "eligibility-check": 35, processing: 50,
  "employer-match": 65, "interview-prep": 75, "decision-pending": 90, approved: 100, rejected: 100,
};
const statusStyle: Record<string, string> = {
  submitted: "bg-accent/15 text-accent-foreground",
  "documents-review": "bg-primary/10 text-primary",
  "eligibility-check": "bg-primary/10 text-primary",
  processing: "bg-accent/15 text-accent-foreground",
  "employer-match": "bg-primary/10 text-primary",
  "interview-prep": "bg-accent/15 text-accent-foreground",
  "decision-pending": "bg-accent/15 text-accent-foreground",
  approved: "bg-secondary/15 text-secondary",
  rejected: "bg-destructive/10 text-destructive",
};

const KANBAN_COLUMNS = [
  { id: "submitted", label: "Submitted", color: "bg-accent" },
  { id: "documents-review", label: "Docs Review", color: "bg-primary" },
  { id: "eligibility-check", label: "Eligibility", color: "bg-primary" },
  { id: "processing", label: "Processing", color: "bg-accent" },
  { id: "employer-match", label: "Employer Match", color: "bg-primary" },
  { id: "interview-prep", label: "Interview", color: "bg-accent" },
  { id: "decision-pending", label: "Decision", color: "bg-accent" },
  { id: "approved", label: "Approved", color: "bg-secondary" },
  { id: "rejected", label: "Rejected", color: "bg-destructive" },
];

interface EligibilityScore {
  qualification: number;
  experience: number;
  language: number;
  age: number;
  germanConnection: number;
}

const calculateScore = (s: EligibilityScore) => s.qualification + s.experience + s.language + s.age + s.germanConnection;

const AdminWorkPermits = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<any>(null);
  const [editForm, setEditForm] = useState({ status: "", details: "" });
  const [scorerOpen, setScorerOpen] = useState(false);
  const [score, setScore] = useState<EligibilityScore>({ qualification: 0, experience: 0, language: 0, age: 0, germanConnection: 0 });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", type: PROGRAMMES[0], details: "", status: "submitted" });

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .in("type", ["work-permit", "Work Permit", ...PROGRAMMES])
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setApplications(data || []);
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editingApp) return;
    const updates: any = { status: editForm.status };
    if (editForm.details.trim()) updates.details = editForm.details;
    const { error } = await supabase.from("applications").update(updates).eq("id", editingApp.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Application Updated" });
    setEditDialogOpen(false);
    fetchApps();
  };

  const handleCreate = async () => {
    if (!createForm.title) { toast({ title: "Please enter a title", variant: "destructive" }); return; }
    const { error } = await supabase.from("applications").insert({
      title: createForm.title, type: createForm.type, details: createForm.details || null,
      status: createForm.status, user_id: user?.id || "",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Work Permit Application Created" }); setCreateDialogOpen(false);
    setCreateForm({ title: "", type: PROGRAMMES[0], details: "", status: "submitted" }); fetchApps();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Application Deleted" }); fetchApps();
  };
  const handleKanbanMove = async (itemId: string, newStatus: string) => {
    const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", itemId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setApplications(prev => prev.map(a => a.id === itemId ? { ...a, status: newStatus } : a));
    toast({ title: "Stage Updated", description: `Application moved to ${newStatus.replace(/-/g, " ")}` });
  };

  const filtered = applications.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchesProgramme = programmeFilter === "all" || a.type === programmeFilter;
    const matchesStage = stageFilter === "all" || a.status === stageFilter;
    return matchesSearch && matchesProgramme && matchesStage;
  });

  const totalScore = calculateScore(score);
  const eligible = totalScore >= 6;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Work Permit Management</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage all work permit and immigration programme applications.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1.5 h-8 text-[12px]" onClick={() => { setCreateForm({ title: "", type: PROGRAMMES[0], details: "", status: "submitted" }); setCreateDialogOpen(true); }}>
              <Plus className="w-3.5 h-3.5" /> Add Application
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-[12px]" onClick={() => setScorerOpen(true)}>
              <Calculator className="w-3.5 h-3.5" /> Scorer
            </Button>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border/60">
              <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setViewMode("table")}>
                <List className="w-3.5 h-3.5" /> Table
              </Button>
              <Button variant={viewMode === "kanban" ? "default" : "ghost"} size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setViewMode("kanban")}>
                <LayoutGrid className="w-3.5 h-3.5" /> Kanban
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Applications", value: applications.length, icon: Briefcase, bg: "bg-primary/10", color: "text-primary" },
            { label: "Processing", value: applications.filter(a => !["approved", "rejected"].includes(a.status)).length, icon: Clock, bg: "bg-accent/15", color: "text-accent" },
            { label: "Approved", value: applications.filter(a => a.status === "approved").length, icon: CheckCircle, bg: "bg-secondary/15", color: "text-secondary" },
            { label: "Rejected", value: applications.filter(a => a.status === "rejected").length, icon: XCircle, bg: "bg-destructive/10", color: "text-destructive" },
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

        {/* Programme Breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PROGRAMMES.map(p => {
            const count = applications.filter(a => a.type === p).length;
            return (
              <Card key={p} className="shadow-card rounded-xl border border-border/60 cursor-pointer hover:shadow-card-hover transition-all" onClick={() => setProgrammeFilter(p)}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-foreground truncate">{p}</p>
                    <p className="text-[11px] text-muted-foreground">{count} application{count !== 1 ? "s" : ""}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="shadow-card rounded-xl border border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search applications..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={programmeFilter} onValueChange={setProgrammeFilter}>
                  <SelectTrigger className="w-[180px] h-9 text-[13px]"><SelectValue placeholder="Programme" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programmes</SelectItem>
                    {PROGRAMMES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-[160px] h-9 text-[13px]"><SelectValue placeholder="Stage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {STAGES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/-/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban View */}
        {viewMode === "kanban" && (
          loading ? (
            <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-[13px]">Loading...</p></div>
          ) : (
            <KanbanBoard
              items={filtered}
              columns={KANBAN_COLUMNS}
              onMoveItem={handleKanbanMove}
              onItemClick={(item) => { setViewingApp(item); setViewDialogOpen(true); }}
            />
          )
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-[13px]">Loading...</p></div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Inbox className="w-8 h-8 text-muted-foreground/40" /></div>
                  <p className="text-[15px] font-semibold text-foreground">No work permit applications</p>
                  <p className="text-[13px] text-muted-foreground mt-1">Applications will appear here as users submit them.</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Application</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Programme</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Stage</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Progress</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-bold">Submitted</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(app => {
                        const progress = stageProgress[app.status] || 10;
                        return (
                          <TableRow key={app.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell>
                              <div>
                                <span className="font-semibold text-[13px] text-foreground block">{app.title}</span>
                                <span className="text-[11px] text-muted-foreground font-mono">{app.id.slice(0, 8)}...</span>
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline" className="text-[10px]">{app.type}</Badge></TableCell>
                            <TableCell><span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg capitalize ${statusStyle[app.status] || "bg-muted"}`}>{app.status.replace(/-/g, " ")}</span></TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 min-w-[120px]">
                                <Progress value={progress} className="h-2 flex-1" />
                                <span className="text-[11px] font-bold text-muted-foreground w-8">{progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-[13px] text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setViewingApp(app); setViewDialogOpen(true); }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setEditingApp(app); setEditForm({ status: app.status, details: app.details || "" }); setEditDialogOpen(true); }}><Pencil className="w-4 h-4 mr-2" /> Update Stage</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDelete(app.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
                    <p className="text-[12px] text-muted-foreground font-medium">Showing {filtered.length} of {applications.length}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {viewingApp && (
            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Title</span><span className="font-semibold">{viewingApp.title}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Programme</span><Badge variant="outline">{viewingApp.type}</Badge></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Stage</span><span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${statusStyle[viewingApp.status]}`}>{viewingApp.status.replace(/-/g, " ")}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Submitted</span>{new Date(viewingApp.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Progress</span>
                <Progress value={stageProgress[viewingApp.status] || 10} className="h-3" />
                <p className="text-[11px] text-muted-foreground mt-1">{stageProgress[viewingApp.status] || 10}% complete</p>
              </div>
              {/* Stage Timeline */}
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-2">Stage Timeline</span>
                <div className="space-y-1">
                  {STAGES.filter(s => s !== "rejected").map(stage => {
                    const current = STAGES.indexOf(viewingApp.status);
                    const idx = STAGES.indexOf(stage);
                    const isDone = idx <= current && viewingApp.status !== "rejected";
                    const isCurrent = stage === viewingApp.status;
                    return (
                      <div key={stage} className={`flex items-center gap-2 py-1 px-2 rounded ${isCurrent ? "bg-primary/5" : ""}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isDone ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {isDone ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <span className={`text-[12px] capitalize ${isCurrent ? "font-bold text-foreground" : isDone ? "text-foreground" : "text-muted-foreground"}`}>{stage.replace(/-/g, " ")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {viewingApp.details && (
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Notes</span><p className="bg-muted/30 rounded-lg p-3">{viewingApp.details}</p></div>
              )}
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Update Application Stage</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/-/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes / Details</Label>
              <Textarea value={editForm.details} onChange={e => setEditForm(f => ({ ...f, details: e.target.value }))} placeholder="Add case notes..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Eligibility Scorer Dialog */}
      <Dialog open={scorerOpen} onOpenChange={setScorerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Germany Opportunity Card — Eligibility Scorer</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-[13px] text-muted-foreground">Minimum 6 points required for eligibility.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Qualification (0-4 pts)</Label>
                <Select value={String(score.qualification)} onValueChange={v => setScore(s => ({ ...s, qualification: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None (0)</SelectItem>
                    <SelectItem value="1">Vocational (1)</SelectItem>
                    <SelectItem value="2">Bachelor's (2)</SelectItem>
                    <SelectItem value="3">Master's (3)</SelectItem>
                    <SelectItem value="4">PhD / Recognized (4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Experience (0-3 pts)</Label>
                <Select value={String(score.experience)} onValueChange={v => setScore(s => ({ ...s, experience: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None (0)</SelectItem>
                    <SelectItem value="1">1-2 years (1)</SelectItem>
                    <SelectItem value="2">3-5 years (2)</SelectItem>
                    <SelectItem value="3">5+ years (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language Skills (0-4 pts)</Label>
                <Select value={String(score.language)} onValueChange={v => setScore(s => ({ ...s, language: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None (0)</SelectItem>
                    <SelectItem value="1">English B1 (1)</SelectItem>
                    <SelectItem value="2">German A2 (2)</SelectItem>
                    <SelectItem value="3">German B1 (3)</SelectItem>
                    <SelectItem value="4">German B2+ (4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Age (0-2 pts)</Label>
                <Select value={String(score.age)} onValueChange={v => setScore(s => ({ ...s, age: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">36+ (0)</SelectItem>
                    <SelectItem value="1">30-35 (1)</SelectItem>
                    <SelectItem value="2">Under 30 (2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Previous Stay in Germany (0-1 pt)</Label>
              <Select value={String(score.germanConnection)} onValueChange={v => setScore(s => ({ ...s, germanConnection: Number(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No (0)</SelectItem>
                  <SelectItem value="1">Yes (1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Card className={`rounded-xl border-2 ${eligible ? "border-secondary bg-secondary/5" : "border-destructive/30 bg-destructive/5"}`}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${eligible ? "bg-secondary/20" : "bg-destructive/10"}`}>
                    <span className={`text-2xl font-bold ${eligible ? "text-secondary" : "text-destructive"}`}>{totalScore}</span>
                  </div>
                  <div className="text-left">
                    <p className={`text-[15px] font-bold ${eligible ? "text-secondary" : "text-destructive"}`}>
                      {eligible ? "✓ Eligible" : "✗ Not Eligible"}
                    </p>
                    <p className="text-[12px] text-muted-foreground">{totalScore}/14 points (minimum 6 required)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Work Permit Application Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>Add Work Permit Application</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="e.g. Schengen Work Permit - Jane Doe" value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Programme</Label>
                <Select value={createForm.type} onValueChange={v => setCreateForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROGRAMMES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={createForm.status} onValueChange={v => setCreateForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STAGES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace(/-/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Details / Notes</Label>
              <Textarea value={createForm.details} onChange={e => setCreateForm(f => ({ ...f, details: e.target.value }))} placeholder="Add details..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleCreate}>Create Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminWorkPermits;
