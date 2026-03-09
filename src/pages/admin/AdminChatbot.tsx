import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart3,
  Bot,
  ChevronDown,
  ChevronRight,
  Inbox,
  Loader2,
  MessageCircle,
  MessageSquare,
  PenTool,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Zap,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useChatbotAdmin, type ChatLog, type TrainingPair } from "@/hooks/useChatbotAdmin";

const CATEGORIES = ["Travel", "Visa", "Work Permits", "Logistics", "Payments", "General"];

interface ChatSessionGroup {
  sessionId: string;
  userName: string;
  logs: ChatLog[];
  latestAt: string;
  matchedCount: number;
}

const AdminChatbot = () => {
  const {
    pairs,
    logs,
    settings,
    setSettings,
    loadingPairs,
    loadingLogs,
    loadingSettings,
    savePair,
    deletePair,
    saveSettings,
    updateLogFeedback,
    refreshLogs,
  } = useChatbotAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingPair | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<TrainingPair | null>(null);
  const [form, setForm] = useState({ keywords: "", response: "", category: CATEGORIES[0], active: true });
  const [saving, setSaving] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [expandedSessions, setExpandedSessions] = useState<string[]>([]);
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<string | null>(null);

  const openCreate = () => {
    setForm({ keywords: "", response: "", category: CATEGORIES[0], active: true });
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (pair: TrainingPair) => {
    setEditing(pair);
    setForm({
      keywords: pair.keywords.join(", "),
      response: pair.response,
      category: pair.category,
      active: pair.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.keywords.trim() || !form.response.trim()) return;
    setSaving(true);
    const keywords = form.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean);
    const ok = await savePair(
      { keywords, response: form.response, category: form.category, active: form.active },
      editing?.id,
    );
    setSaving(false);
    if (ok) setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleting) await deletePair(deleting.id);
    setDeleteOpen(false);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
  };

  const matchRate = logs.length > 0 ? Math.round((logs.filter((log) => log.matched).length / logs.length) * 100) : 0;
  const positiveRate = logs.filter((log) => log.feedback).length > 0
    ? Math.round((logs.filter((log) => log.feedback === "positive").length / logs.filter((log) => log.feedback).length) * 100)
    : 0;

  const normalizedLogSearch = logSearch.trim().toLowerCase();
  const filteredLogs = logs.filter((log) => {
    if (!normalizedLogSearch) return true;
    return [log.user_name, log.user_message, log.bot_response, log.session_id]
      .some((value) => value.toLowerCase().includes(normalizedLogSearch));
  });

  const groupedSessions = filteredLogs.reduce<ChatSessionGroup[]>((acc, log) => {
    const session = acc.find((item) => item.sessionId === log.session_id);

    if (session) {
      session.logs.push(log);
      session.latestAt = session.latestAt > log.created_at ? session.latestAt : log.created_at;
      session.matchedCount += log.matched ? 1 : 0;
      if (!session.userName && log.user_name) session.userName = log.user_name;
      return acc;
    }

    acc.push({
      sessionId: log.session_id,
      userName: log.user_name,
      logs: [log],
      latestAt: log.created_at,
      matchedCount: log.matched ? 1 : 0,
    });

    return acc;
  }, []);

  const filteredMatchRate = filteredLogs.length > 0
    ? Math.round((filteredLogs.filter((log) => log.matched).length / filteredLogs.length) * 100)
    : 0;
  const unresolvedCount = filteredLogs.filter((log) => !log.matched).length;

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => (
      prev.includes(sessionId)
        ? prev.filter((value) => value !== sessionId)
        : [...prev, sessionId]
    ));
  };

  const handleFeedback = async (logId: string, feedback: "positive" | "negative") => {
    setUpdatingFeedbackId(logId);
    try {
      await updateLogFeedback(logId, feedback);
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold tracking-tight text-foreground">Chatbot Management</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Train, configure, and monitor your AI chatbot assistant.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Training Pairs", value: loadingPairs ? "..." : pairs.length, icon: Zap, color: "text-accent" },
            { label: "Conversations", value: loadingLogs ? "..." : logs.length, icon: MessageCircle, color: "text-primary" },
            { label: "Match Rate", value: loadingLogs ? "..." : `${matchRate}%`, icon: BarChart3, color: "text-secondary" },
            { label: "Satisfaction", value: loadingLogs ? "..." : `${positiveRate}%`, icon: ThumbsUp, color: "text-secondary" },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-xl border border-border/60 shadow-card">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="training">
          <TabsList>
            <TabsTrigger value="training"><Bot className="mr-1.5 h-4 w-4" />Training Data</TabsTrigger>
            <TabsTrigger value="logs"><MessageSquare className="mr-1.5 h-4 w-4" />Chat Logs</TabsTrigger>
            <TabsTrigger value="settings"><Zap className="mr-1.5 h-4 w-4" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <Card className="mt-4 rounded-xl border border-border/60 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Training Pairs</CardTitle>
                  <CardDescription>Keyword to response mappings injected into the chatbot knowledge base.</CardDescription>
                </div>
                <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" />Add Pair</Button>
              </CardHeader>
              <CardContent>
                {loadingPairs ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : pairs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Inbox className="h-7 w-7 text-muted-foreground/40" /></div>
                    <p className="text-[14px] font-semibold text-foreground">No training data</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">Add keyword-response pairs to enhance the chatbot.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pairs.map((pair) => (
                      <div key={pair.id} className="rounded-lg border border-border bg-background p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              {pair.keywords.map((keyword) => <Badge key={keyword} variant="secondary" className="text-[11px]">{keyword}</Badge>)}
                              <Badge variant="outline" className="text-[11px]">{pair.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{pair.response}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant={pair.active ? "default" : "secondary"}>{pair.active ? "Active" : "Inactive"}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(pair)}><PenTool className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleting(pair); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="mt-4 overflow-hidden rounded-xl border border-border/60 shadow-card">
              <CardHeader className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-lg">Chat Logs</CardTitle>
                    <CardDescription>Search conversations, expand sessions, and rate response quality.</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={refreshLogs}><RefreshCw className="mr-1 h-4 w-4" />Refresh</Button>
                </div>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="Search by user, message, bot reply, or session ID"
                      className="pl-9"
                    />
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sessions</p>
                    <p className="text-sm font-semibold text-foreground">{groupedSessions.length}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Filtered Match Rate</p>
                    <p className="text-sm font-semibold text-foreground">{filteredMatchRate}%</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Needs Review</p>
                    <p className="text-sm font-semibold text-foreground">{unresolvedCount}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : groupedSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Inbox className="mb-3 h-7 w-7 text-muted-foreground/40" />
                    <p className="text-[14px] font-semibold text-foreground">{logs.length === 0 ? "No chat logs yet" : "No matching chat logs"}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {logs.length === 0
                        ? "Conversations will appear here once users interact with the chatbot."
                        : "Try a different search term to find the conversation you need."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupedSessions.map((session) => {
                      const isExpanded = expandedSessions.includes(session.sessionId);
                      const feedbackCount = session.logs.filter((log) => !!log.feedback).length;

                      return (
                        <div key={session.sessionId} className="rounded-xl border border-border/60 bg-background">
                          <button
                            type="button"
                            onClick={() => toggleSession(session.sessionId)}
                            className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                          >
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{session.userName || "Guest"}</p>
                                <Badge variant="outline" className="text-[11px]">
                                  {session.logs.length} {session.logs.length === 1 ? "message" : "messages"}
                                </Badge>
                                <Badge variant={session.matchedCount === session.logs.length ? "secondary" : "destructive"} className="text-[11px]">
                                  {session.matchedCount === session.logs.length ? "All matched" : `${session.logs.length - session.matchedCount} unmatched`}
                                </Badge>
                                {feedbackCount > 0 && <Badge variant="secondary" className="text-[11px]">{feedbackCount} rated</Badge>}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                                <span>Session: {session.sessionId}</span>
                                <span>Last activity {formatDistanceToNow(new Date(session.latestAt), { addSuffix: true })}</span>
                              </div>
                              <p className="truncate text-[13px] text-muted-foreground">{session.logs[0]?.user_message}</p>
                            </div>
                            <div className="shrink-0 pt-1 text-muted-foreground">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-border/60 px-4 py-4">
                              <div className="space-y-4">
                                {session.logs.map((log) => (
                                  <div key={log.id} className="rounded-lg border border-border/60 bg-muted/20 p-4">
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant={log.matched ? "outline" : "destructive"} className="text-[11px]">
                                          {log.matched ? "Matched" : "Fallback / Unmatched"}
                                        </Badge>
                                        <span className="text-[12px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant={log.feedback === "positive" ? "default" : "ghost"}
                                          className="h-8 w-8"
                                          disabled={updatingFeedbackId === log.id}
                                          onClick={() => handleFeedback(log.id, "positive")}
                                        >
                                          {updatingFeedbackId === log.id && log.feedback !== "negative"
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <ThumbsUp className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant={log.feedback === "negative" ? "destructive" : "ghost"}
                                          className="h-8 w-8"
                                          disabled={updatingFeedbackId === log.id}
                                          onClick={() => handleFeedback(log.id, "negative")}
                                        >
                                          {updatingFeedbackId === log.id && log.feedback !== "positive"
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <ThumbsDown className="h-4 w-4" />}
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="grid gap-3 lg:grid-cols-2">
                                      <div className="rounded-lg border border-border bg-background p-3">
                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">User message</p>
                                        <p className="whitespace-pre-wrap text-sm text-foreground">{log.user_message}</p>
                                      </div>
                                      <div className="rounded-lg border border-border bg-background p-3">
                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Bot response</p>
                                        <p className="whitespace-pre-wrap text-sm text-foreground">{log.bot_response}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Card className="rounded-xl border border-border/60 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {loadingSettings ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-semibold">Enable Chatbot</Label>
                          <p className="text-[12px] text-muted-foreground">Show chatbot on the website</p>
                        </div>
                        <Switch checked={settings.bot_enabled} onCheckedChange={(value) => setSettings((state) => ({ ...state, bot_enabled: value }))} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-semibold">WhatsApp Integration</Label>
                          <p className="text-[12px] text-muted-foreground">Forward unanswered queries to WhatsApp</p>
                        </div>
                        <Switch checked={settings.whatsapp_enabled} onCheckedChange={(value) => setSettings((state) => ({ ...state, whatsapp_enabled: value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Bot Name</Label>
                        <Input value={settings.bot_name} onChange={(e) => setSettings((state) => ({ ...state, bot_name: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Greeting Message</Label>
                        <Textarea value={settings.greeting} onChange={(e) => setSettings((state) => ({ ...state, greeting: e.target.value }))} rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label>Fallback Response</Label>
                        <Textarea value={settings.fallback} onChange={(e) => setSettings((state) => ({ ...state, fallback: e.target.value }))} rows={2} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveSettings} disabled={saving}>
                          {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSettings({
                            bot_name: "AtlasWave Assistant",
                            greeting: "Hello! ðŸ‘‹ Welcome to AtlasWave Travel & Tours. How can I help you today?",
                            fallback: "I'm not sure about that. Would you like to speak with a human agent?",
                            bot_enabled: true,
                            whatsapp_enabled: false,
                          })}
                        >
                          <RotateCcw className="mr-1.5 h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-border/60 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Bot Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] space-y-3 overflow-auto rounded-xl bg-muted p-4">
                    <div className="flex gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary"><Bot className="h-4 w-4 text-primary-foreground" /></div>
                      <div className="max-w-[80%] rounded-lg rounded-tl-none border bg-card p-3">
                        <p className="text-sm text-foreground">{settings.greeting}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <div className="max-w-[80%] rounded-lg rounded-tr-none bg-primary p-3">
                        <p className="text-sm text-primary-foreground">How do I book a flight?</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary"><Bot className="h-4 w-4 text-primary-foreground" /></div>
                      <div className="max-w-[80%] rounded-lg rounded-tl-none border bg-card p-3">
                        <p className="text-sm text-foreground">You can book flights through our Travel Services. Visit /travel/flights to search and book.</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <div className="max-w-[80%] rounded-lg rounded-tr-none bg-primary p-3">
                        <p className="text-sm text-primary-foreground">What about cryptocurrency?</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary"><Bot className="h-4 w-4 text-primary-foreground" /></div>
                      <div className="max-w-[80%] rounded-lg rounded-tl-none border bg-card p-3">
                        <p className="text-sm text-foreground">{settings.fallback}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? "Edit Training Pair" : "Add Training Pair"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Keywords (comma-separated) *</Label>
              <Input value={form.keywords} onChange={(e) => setForm((state) => ({ ...state, keywords: e.target.value }))} placeholder="flight, book, airplane, ticket" />
            </div>
            <div className="space-y-2">
              <Label>Bot Response *</Label>
              <Textarea value={form.response} onChange={(e) => setForm((state) => ({ ...state, response: e.target.value }))} rows={3} placeholder="The response the bot will give..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm((state) => ({ ...state, category: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch checked={form.active} onCheckedChange={(value) => setForm((state) => ({ ...state, active: value }))} />
                <Label>{form.active ? "Active" : "Inactive"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              {editing ? "Save" : "Add Pair"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Training Pair</DialogTitle></DialogHeader>
          <p className="py-2 text-[13px] text-muted-foreground">This will permanently remove this training pair. The chatbot will no longer use these keywords.</p>
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
