import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FolderOpen, Inbox, Trash2, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  file_type: string;
  file_size: string | null;
  file_path: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

const AdminDocumentation = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    // Fetch documents first
    const { data: docs, error: docError } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (docError) {
      toast({ title: "Error", description: docError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch profiles for the unique user IDs found in documents
    const userIds = [...new Set((docs || []).map(d => d.user_id))];
    if (userIds.length > 0) {
      const { data: profiles, error: profError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (!profError && profiles) {
        const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
        const docsWithProfiles = (docs || []).map(d => ({
          ...d,
          profiles: profileMap[d.user_id] || { full_name: "Unknown User" }
        }));
        setDocuments(docsWithProfiles as Document[]);
      } else {
        setDocuments((docs || []) as unknown as Document[]);
      }
    } else {
      setDocuments((docs || []) as unknown as Document[]);
    }
    
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleDelete = async (doc: Document) => {
    if (doc.file_path) {
      await supabase.storage.from("user-documents").remove([doc.file_path]);
    }
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Document deleted" });
    fetchDocuments();
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.file_path) return;
    const { data } = await supabase.storage.from("user-documents").createSignedUrl(doc.file_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Document Management</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">View and manage all user-uploaded documents.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Total Documents", value: documents.length, icon: FileText, bg: "bg-primary/10", color: "text-primary" },
            { label: "Users with Docs", value: [...new Set(documents.map(d => d.user_id))].length, icon: FolderOpen, bg: "bg-accent/15", color: "text-accent" },
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
              <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
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
                <p className="text-[15px] font-semibold text-foreground">No documents found</p>
                <p className="text-[13px] text-muted-foreground mt-1">Documents uploaded by users will appear here.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Document</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Category</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Type</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">User</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Uploaded</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(d => (
                    <TableRow key={d.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <p className="font-semibold text-[13px]">{d.name}</p>
                        <p className="text-[11px] text-muted-foreground">{d.file_size || "—"}</p>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px] capitalize">{d.category || "General"}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{d.file_type}</Badge></TableCell>
                      <TableCell>
                        <p className="text-[13px] font-medium text-foreground">{d.profiles?.full_name || "Unknown User"}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{d.user_id?.slice(0, 8)}</p>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(d)}><Download className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(d)}><Trash2 className="w-4 h-4" /></Button>
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
    </AdminLayout>
  );
};

export default AdminDocumentation;
