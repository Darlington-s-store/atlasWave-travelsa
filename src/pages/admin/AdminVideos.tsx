import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Video, Upload, Link as LinkIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import type { Video as VideoType } from "@/hooks/useVideos";

const categories = ["hero", "services", "gallery", "about", "general"];

const emptyForm = {
  title: "",
  description: "",
  video_type: "embed" as "embed" | "upload",
  video_url: "",
  category: "gallery",
  sort_order: 0,
  visible: true,
};

const AdminVideos = () => {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (data) setVideos(data as VideoType[]);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("video-uploads").upload(path, file);
    if (error) throw error;
    return path;
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSaving(true);

    try {
      let file_path = editId ? (videos.find(v => v.id === editId)?.file_path || null) : null;
      let thumbnail_url = editId ? (videos.find(v => v.id === editId)?.thumbnail_url || null) : null;

      if (videoFile) {
        file_path = await uploadFile(videoFile, "videos");
      }
      if (thumbnailFile) {
        thumbnail_url = await uploadFile(thumbnailFile, "thumbnails");
      }

      const payload = {
        title: form.title,
        description: form.description || null,
        video_type: form.video_type,
        video_url: form.video_type === "embed" ? form.video_url : null,
        file_path: form.video_type === "upload" ? file_path : null,
        thumbnail_url,
        category: form.category,
        sort_order: form.sort_order,
        visible: form.visible,
        updated_at: new Date().toISOString(),
      };

      if (editId) {
        const { error } = await supabase.from("videos").update(payload).eq("id", editId);
        if (error) throw error;
        toast({ title: "Video updated" });
      } else {
        const { error } = await supabase.from("videos").insert(payload);
        if (error) throw error;
        toast({ title: "Video added" });
      }

      setDialogOpen(false);
      resetForm();
      fetchVideos();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    toast({ title: "Video deleted" });
    fetchVideos();
  };

  const toggleVisibility = async (id: string, visible: boolean) => {
    await supabase.from("videos").update({ visible: !visible }).eq("id", id);
    fetchVideos();
  };

  const openEdit = (video: VideoType) => {
    setEditId(video.id);
    setForm({
      title: video.title,
      description: video.description || "",
      video_type: video.video_type as "embed" | "upload",
      video_url: video.video_url || "",
      category: video.category,
      sort_order: video.sort_order,
      visible: video.visible,
    });
    setVideoFile(null);
    setThumbnailFile(null);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
    setVideoFile(null);
    setThumbnailFile(null);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">Manage videos displayed across the website.</p>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Video
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : videos.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No videos yet.</TableCell></TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>
                    <Badge variant={video.video_type === "embed" ? "secondary" : "outline"}>
                      {video.video_type === "embed" ? <LinkIcon className="w-3 h-3 mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
                      {video.video_type}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{video.category}</Badge></TableCell>
                  <TableCell>{video.sort_order}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleVisibility(video.id, video.visible)}>
                      {video.visible ? <Eye className="w-4 h-4 text-accent" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(video)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(video.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { setDialogOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Video" : "Add Video"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Video title" />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.video_type} onValueChange={(v) => setForm({ ...form, video_type: v as "embed" | "upload" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="embed">YouTube/Vimeo Embed</SelectItem>
                    <SelectItem value="upload">Upload Video File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.video_type === "embed" ? (
              <div>
                <Label>Video URL</Label>
                <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
              </div>
            ) : (
              <div>
                <Label>Video File</Label>
                <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                {editId && !videoFile && <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current video.</p>}
              </div>
            )}

            <div>
              <Label>Thumbnail Image (optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.visible} onCheckedChange={(v) => setForm({ ...form, visible: v })} />
                <Label>Visible on website</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editId ? "Update" : "Add"} Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminVideos;
