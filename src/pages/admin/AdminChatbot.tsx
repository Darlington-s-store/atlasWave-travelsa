import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  MessageSquare, Plus, Trash2, PenTool, Bot, Inbox, Zap,
  BarChart3, MessageCircle, ThumbsUp, ThumbsDown, Save, RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrainingPair {
  id: string;
  keywords: string[];
  response: string;
  category: string;
  active: boolean;
}

interface ChatLog {
  id: string;
  user: string;
  message: string;
  botResponse: string;
  matched: boolean;
  timestamp: string;
  feedback: "positive" | "negative" | null;
}

const CATEGORIES = ["Travel", "Visa", "Work Permits", "Logistics", "Payments", "General"];

const MOCK_LOGS: ChatLog[] = [
  { id: "1", user: "Guest", message: "How do I book a flight?", botResponse: "You can book flights through our Travel Services section.", matched: true, timestamp: "2 min ago", feedback: "positive" },
  { id: "2", user: "John D.", message: "What are the LMIA requirements?", botResponse: "I can help with LMIA info. Visit our Canada LMIA page for details.", matched: true, timestamp: "15 min ago", feedback: null },
  { id: "3", user: "Guest", message: "Can I get a refund?", botResponse: "I'm not sure about that. Let me connect you with support.", matched: false, timestamp: "1 hr ago", feedback: "negative" },
  { id: "4", user: "Ama K.", message: "Track my shipment", botResponse: "You can track shipments at /logistics/tracking with your tracking ID.", matched: true, timestamp: "2 hrs ago", feedback: "positive" },
  { id: "5", user: "Guest", message: "What visa do I need for Germany?", botResponse: "For Germany, we offer Chancenkarte and Schengen work permits.", matched: true, timestamp: "3 hrs ago", feedback: "positive" },
];

const MOCK_PAIRS: TrainingPair[] = [
  { id: "1", keywords: ["flight", "book", "airplane", "ticket"], response: "You can book flights through our Travel Services. Visit /travel/flights to search and book.", category: "Travel", active: true },
  { id: "2", keywords: ["visa", "schengen", "travel visa"], response: "We offer visa assistance for Schengen, USA, UK, and Canada. Check /travel/visa for details.", category: "Visa", active: true },
  { id: "3", keywords: ["track", "shipment", "cargo", "delivery"], response: "Track your shipment at /logistics/tracking using your tracking ID.", category: "Logistics", active: true },
  { id: "4", keywords: ["lmia", "canada", "canadian work"], response: "Our Canada LMIA program helps you secure employment in Canada. Visit /work-permits/canada-lmia.", category: "Work Permits", active: true },
];

let nextId = 10;

const AdminChatbot = () => {
  const { toast } = useToast();
  const [pairs, setPairs] = useState<TrainingPair[]>(MOCK_PAIRS);
  const [logs] = useState<ChatLog[]>(MOCK_LOGS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingPair | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<TrainingPair | null>(null);
  const [form, setForm] = useState({ keywords: "", response: "", category: CATEGORIES[0], active: true });

  // Settings
  const [botName, setBotName] = useState("GlobeLink Assistant");
  const [greeting, setGreeting] = useState("Hi! 👋 How can I help you today?");
  const [fallback, setFallback] = useState("I'm not sure about that. Would you like to speak with a human agent?");
  const [botEnabled, setBotEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  const openCreate = () => { setForm({ keywords: "", response: "", category: CATEGORIES[0], active: true }); setEditing(null); setDialogOpen(true); };
  const openEdit = (p: TrainingPair) => { setEditing(p); setForm({ keywords: p.keywords.join(", "), response: p.response, category: p.category, active: p.active }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.keywords.trim() || !form.response.trim()) { toast({ title: "Keywords and response required", variant: "destructive" }); return; }
    const keywords = form.keywords.split(",").map(k => k.trim()).filter(Boolean);
    if (editing) {
      setPairs(prev => prev.map(p => p.id === editing.id ? { ...p, keywords, response: form.response, category: form.category, active: form.active } : p));
      toast({ title: "Training pair updated" });
    } else {
      setPairs(prev => [...prev, { id: String(nextId++), keywords, response: form.response, category: form.category, active: form.active }]);
      toast({ title: "Training pair added" });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleting) setPairs(prev => prev.filter(p => p.id !== deleting.id));
    toast({ title: "Training pair deleted" });
    setDeleteOpen(false);
  };

  const matchRate = logs.length > 0 ? Math.round((logs.filter(l => l.matched).length / logs.length) * 100) : 0;
  const positiveRate = logs.filter(l => l.feedback).length > 0
    ? Math.round((logs.filter(l => l.feedback === "positive").length / logs.filter(l => l.feedback).length) * 100) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Chatbot Management</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Train, configure, and monitor your AI chatbot assistant.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Training Pairs", value: pairs.length, icon: Zap, color: "text-accent" },
            { label: "Conversations", value: logs.length, icon: MessageCircle, color: "text-primary" },
            { label: "Match Rate", value: `${matchRate}%`, icon: BarChart3, color: "text-secondary" },
            { label: "Satisfaction", value: `${positiveRate}%`, icon: ThumbsUp, color: "text-secondary" },
          ].map(s => (
            <Card key={s.label} className="shadow-card rounded-xl border border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="training">
          <TabsList>
            <TabsTrigger value="training"><Bot className="w-4 h-4 mr-1.5" />Training Data</TabsTrigger>
            <TabsTrigger value="logs"><MessageSquare className="w-4 h-4 mr-1.5" />Chat Logs</TabsTrigger>
            <TabsTrigger value="settings"><Zap className="w-4 h-4 mr-1.5" />Settings</TabsTrigger>
          </TabsList>

          {/* Training Data */}
          <TabsContent value="training">
            <Card className="shadow-card mt-4 rounded-xl border border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Training Pairs</CardTitle>
                  <CardDescription>Keyword → Response mappings for the chatbot.</CardDescription>
                </div>
                <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Add Pair</Button>
              </CardHeader>
              <CardContent>
                {pairs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3"><Inbox className="w-7 h-7 text-muted-foreground/40" /></div>
                    <p className="text-[14px] font-semibold text-foreground">No training data</p>
                    <p className="text-[12px] text-muted-foreground mt-1">Add keyword-response pairs to train the chatbot.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pairs.map(p => (
                      <div key={p.id} className="p-4 rounded-lg border border-border bg-background">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              {p.keywords.map(k => <Badge key={k} variant="secondary" className="text-[11px]">{k}</Badge>)}
                              <Badge variant="outline" className="text-[11px]">{p.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{p.response}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Active" : "Inactive"}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><PenTool className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleting(p); setDeleteOpen(true); }}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Logs */}
          <TabsContent value="logs">
            <Card className="shadow-card mt-4 rounded-xl border border-border/60 overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">User</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Message</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Bot Response</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Match</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Feedback</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-bold">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium text-[13px]">{log.user}</TableCell>
                        <TableCell className="text-[13px] max-w-[200px] truncate">{log.message}</TableCell>
                        <TableCell className="text-[13px] text-muted-foreground max-w-[200px] truncate">{log.botResponse}</TableCell>
                        <TableCell>
                          <Badge variant={log.matched ? "default" : "destructive"} className="text-[10px]">
                            {log.matched ? "Matched" : "Missed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.feedback === "positive" && <ThumbsUp className="w-4 h-4 text-secondary" />}
                          {log.feedback === "negative" && <ThumbsDown className="w-4 h-4 text-destructive" />}
                          {!log.feedback && <span className="text-[11px] text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-[12px] text-muted-foreground">{log.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="grid lg:grid-cols-2 gap-4 mt-4">
              <Card className="shadow-card rounded-xl border border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div><Label className="font-semibold">Enable Chatbot</Label><p className="text-[12px] text-muted-foreground">Show chatbot on the website</p></div>
                    <Switch checked={botEnabled} onCheckedChange={setBotEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><Label className="font-semibold">WhatsApp Integration</Label><p className="text-[12px] text-muted-foreground">Forward unanswered queries to WhatsApp</p></div>
                    <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bot Name</Label>
                    <Input value={botName} onChange={e => setBotName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Greeting Message</Label>
                    <Textarea value={greeting} onChange={e => setGreeting(e.target.value)} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fallback Response</Label>
                    <Textarea value={fallback} onChange={e => setFallback(e.target.value)} rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => toast({ title: "Settings saved" })}><Save className="w-4 h-4 mr-1.5" />Save</Button>
                    <Button variant="outline" onClick={() => { setBotName("GlobeLink Assistant"); setGreeting("Hi! 👋 How can I help you today?"); setFallback("I'm not sure about that. Would you like to speak with a human agent?"); }}>
                      <RotateCcw className="w-4 h-4 mr-1.5" />Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card rounded-xl border border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Bot Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-xl p-4 space-y-3 max-h-[400px] overflow-auto">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary-foreground" /></div>
                      <div className="bg-card rounded-lg rounded-tl-none p-3 border max-w-[80%]">
                        <p className="text-sm text-foreground">{greeting}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <div className="bg-primary rounded-lg rounded-tr-none p-3 max-w-[80%]">
                        <p className="text-sm text-primary-foreground">How do I book a flight?</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary-foreground" /></div>
                      <div className="bg-card rounded-lg rounded-tl-none p-3 border max-w-[80%]">
                        <p className="text-sm text-foreground">You can book flights through our Travel Services. Visit /travel/flights to search and book.</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <div className="bg-primary rounded-lg rounded-tr-none p-3 max-w-[80%]">
                        <p className="text-sm text-primary-foreground">What about cryptocurrency?</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary-foreground" /></div>
                      <div className="bg-card rounded-lg rounded-tl-none p-3 border max-w-[80%]">
                        <p className="text-sm text-foreground">{fallback}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? "Edit Training Pair" : "Add Training Pair"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Keywords (comma-separated) *</Label>
              <Input value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} placeholder="flight, book, airplane, ticket" />
            </div>
            <div className="space-y-2">
              <Label>Bot Response *</Label>
              <Textarea value={form.response} onChange={e => setForm(f => ({ ...f, response: e.target.value }))} rows={3} placeholder="The response the bot will give..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
                <Label>{form.active ? "Active" : "Inactive"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>{editing ? "Save" : "Add Pair"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Training Pair</DialogTitle></DialogHeader>
          <p className="text-[13px] text-muted-foreground py-2">This will permanently remove this training pair. The chatbot will no longer respond to these keywords.</p>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminChatbot;
