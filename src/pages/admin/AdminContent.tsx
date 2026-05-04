import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PenTool, Globe, Star, Handshake, Save, Plus, Trash2, Inbox, Loader2, Upload, ImageIcon, SlidersHorizontal, Video, ArrowUp, ArrowDown } from "lucide-react";
import { getStorageUrl } from "@/hooks/useSiteContent";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: Record<string, string>;
  updated_at: string;
}

const CATEGORIES = ["Travel", "Logistics", "Government", "Education", "Finance"];

const emptySlideForm = {
  badge: "",
  title: "",
  highlight: "",
  title_end: "",
  description: "",
  cta_label: "",
  cta_link: "",
  cta_secondary_label: "",
  cta_secondary_link: "",
  sort_order: "0",
  active: true,
};

const AdminContent = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SiteContent[]>([]);

  // Hero slides state
  const [heroSlides, setHeroSlides] = useState<SiteContent[]>([]);
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SiteContent | null>(null);
  const [slideForm, setSlideForm] = useState(emptySlideForm);
  const [slideImageFile, setSlideImageFile] = useState<File | null>(null);

  // Hero video state
  const [heroVideos, setHeroVideos] = useState<any[]>([]);
  const [heroVideoDialogOpen, setHeroVideoDialogOpen] = useState(false);
  const [heroVideoForm, setHeroVideoForm] = useState({ video_type: "embed" as "embed" | "upload", video_url: "", title: "Hero Background Video" });
  const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
  const [editingHeroVideo, setEditingHeroVideo] = useState<any>(null);

  // Contact form state
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactHours, setContactHours] = useState("");
  const [contactId, setContactId] = useState<string | null>(null);

  // Services state
  const [services, setServices] = useState<SiteContent[]>([]);
  const [svcDialogOpen, setSvcDialogOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState<SiteContent | null>(null);
  const [svcForm, setSvcForm] = useState({ title: "", description: "", icon: "FileText", active: true });

  // Testimonials state
  const [testimonials, setTestimonials] = useState<SiteContent[]>([]);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<SiteContent | null>(null);
  const [testForm, setTestForm] = useState({ name: "", text: "", rating: "5", visible: true });

  // Partners state
  const [partners, setPartners] = useState<SiteContent[]>([]);
  const [partDialogOpen, setPartDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SiteContent | null>(null);
  const [partForm, setPartForm] = useState({ name: "", category: CATEGORIES[0] });
  const [partLogoFile, setPartLogoFile] = useState<File | null>(null);
  const [uploadingPartLogo, setUploadingPartLogo] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; table?: string } | null>(null);

  useEffect(() => {
    fetchContent();
    fetchHeroVideos();
  }, []);

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("cms-images").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload Error", description: error.message, variant: "destructive" });
      return null;
    }
    return path;
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `videos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("video-uploads").upload(path, file);
    if (error) {
      toast({ title: "Upload Error", description: error.message, variant: "destructive" });
      return null;
    }
    return path;
  };

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .order("section", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to load content", variant: "destructive" });
    } else {
      const items = (data || []) as SiteContent[];
      setContent(items);

      // Parse contact content
      const contact = items.find(i => i.section === "contact" && i.key === "info");
      if (contact) {
        setContactId(contact.id);
        setContactEmail(contact.value.email || "");
        setContactPhone(contact.value.phone || "");
        setContactAddress(contact.value.address || "");
        setContactHours(contact.value.hours || "");
      }

      // Parse hero slides
      const slides = items
        .filter(i => i.section === "hero_slides")
        .sort((a, b) => parseInt(a.value.sort_order || "0") - parseInt(b.value.sort_order || "0"));
      setHeroSlides(slides);

      // Parse services
      setServices(items.filter(i => i.section === "services"));

      // Parse testimonials
      setTestimonials(items.filter(i => i.section === "testimonials"));

      // Parse partners
      setPartners(items.filter(i => i.section === "partners"));
    }
    setLoading(false);
  };

  const fetchHeroVideos = async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("category", "hero")
      .order("sort_order");
    if (data) setHeroVideos(data);
  };

  // ---- Hero Slides handlers ----
  const openSlideCreate = () => {
    setSlideForm({ ...emptySlideForm, sort_order: String(heroSlides.length) });
    setEditingSlide(null);
    setSlideImageFile(null);
    setSlideDialogOpen(true);
  };

  const openSlideEdit = (s: SiteContent) => {
    setEditingSlide(s);
    setSlideForm({
      badge: s.value.badge || "",
      title: s.value.title || "",
      highlight: s.value.highlight || "",
      title_end: s.value.title_end || "",
      description: s.value.description || "",
      cta_label: s.value.cta_label || "",
      cta_link: s.value.cta_link || "",
      cta_secondary_label: s.value.cta_secondary_label || "",
      cta_secondary_link: s.value.cta_secondary_link || "",
      sort_order: s.value.sort_order || "0",
      active: s.value.active !== "false",
    });
    setSlideImageFile(null);
    setSlideDialogOpen(true);
  };

  const handleSlideSave = async () => {
    if (!slideForm.title.trim() || !slideForm.highlight.trim()) {
      toast({ title: "Title and highlight are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    let imageUrl = editingSlide?.value.image_url || "";
    if (slideImageFile) {
      const path = await uploadImage(slideImageFile, "hero-slides");
      if (path) imageUrl = path;
    }

    const value = {
      ...slideForm,
      active: String(slideForm.active),
      image_url: imageUrl,
    };

    if (editingSlide) {
      const { error } = await supabase
        .from("site_content")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", editingSlide.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Slide updated" });
    } else {
      const key = `slide_${Date.now()}`;
      const { error } = await supabase
        .from("site_content")
        .insert({ section: "hero_slides", key, value });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Slide added" });
    }

    setSlideDialogOpen(false);
    setSaving(false);
    fetchContent();
  };

  const moveSlide = async (index: number, direction: -1 | 1) => {
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= heroSlides.length) return;
    const a = heroSlides[index];
    const b = heroSlides[swapIndex];
    await Promise.all([
      supabase.from("site_content").update({ value: { ...a.value, sort_order: String(swapIndex) } }).eq("id", a.id),
      supabase.from("site_content").update({ value: { ...b.value, sort_order: String(index) } }).eq("id", b.id),
    ]);
    fetchContent();
  };

  // ---- Hero Video handlers ----
  const openHeroVideoCreate = () => {
    setEditingHeroVideo(null);
    setHeroVideoForm({ video_type: "embed", video_url: "", title: "Hero Background Video" });
    setHeroVideoFile(null);
    setHeroVideoDialogOpen(true);
  };

  const openHeroVideoEdit = (v: any) => {
    setEditingHeroVideo(v);
    setHeroVideoForm({ video_type: v.video_type, video_url: v.video_url || "", title: v.title });
    setHeroVideoFile(null);
    setHeroVideoDialogOpen(true);
  };

  const handleHeroVideoSave = async () => {
    setSaving(true);
    let file_path = editingHeroVideo?.file_path || null;
    if (heroVideoFile) {
      file_path = await uploadVideo(heroVideoFile);
    }

    const payload = {
      title: heroVideoForm.title,
      video_type: heroVideoForm.video_type,
      video_url: heroVideoForm.video_type === "embed" ? heroVideoForm.video_url : null,
      file_path: heroVideoForm.video_type === "upload" ? file_path : null,
      category: "hero",
      visible: true,
      sort_order: 0,
      updated_at: new Date().toISOString(),
    };

    if (editingHeroVideo) {
      const { error } = await supabase.from("videos").update(payload).eq("id", editingHeroVideo.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Hero video updated" });
    } else {
      const { error } = await supabase.from("videos").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Hero video added" });
    }

    setHeroVideoDialogOpen(false);
    setSaving(false);
    fetchHeroVideos();
  };

  const deleteHeroVideo = async (id: string) => {
    await supabase.from("videos").delete().eq("id", id);
    toast({ title: "Hero video removed" });
    fetchHeroVideos();
  };

  // ---- Contact ----
  const saveContact = async () => {
    setSaving(true);
    const value = { email: contactEmail, phone: contactPhone, address: contactAddress, hours: contactHours };
    if (contactId) {
      const { error } = await supabase.from("site_content").update({ value, updated_at: new Date().toISOString() }).eq("id", contactId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Saved", description: "Contact info updated." });
    } else {
      const { error } = await supabase.from("site_content").insert({ section: "contact", key: "info", value });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { toast({ title: "Saved", description: "Contact info created." }); fetchContent(); }
    }
    setSaving(false);
  };

  // ---- Services ----
  const openSvcCreate = () => { setSvcForm({ title: "", description: "", icon: "FileText", active: true }); setEditingSvc(null); setSvcDialogOpen(true); };
  const openSvcEdit = (s: SiteContent) => {
    setEditingSvc(s);
    setSvcForm({ title: s.value.title || "", description: s.value.description || "", icon: s.value.icon || "FileText", active: s.value.active !== "false" });
    setSvcDialogOpen(true);
  };
  const handleSvcSave = async () => {
    if (!svcForm.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    setSaving(true);
    const value = { ...svcForm, active: String(svcForm.active) };
    if (editingSvc) {
      await supabase.from("site_content").update({ value, updated_at: new Date().toISOString() }).eq("id", editingSvc.id);
      toast({ title: "Service Updated" });
    } else {
      await supabase.from("site_content").insert({ section: "services", key: svcForm.title.toLowerCase().replace(/\s+/g, "_"), value });
      toast({ title: "Service Added" });
    }
    setSvcDialogOpen(false); setSaving(false); fetchContent();
  };

  // ---- Testimonials ----
  const openTestCreate = () => { setTestForm({ name: "", text: "", rating: "5", visible: true }); setEditingTest(null); setTestDialogOpen(true); };
  const openTestEdit = (t: SiteContent) => {
    setEditingTest(t);
    setTestForm({ name: t.value.name || "", text: t.value.text || "", rating: t.value.rating || "5", visible: t.value.visible !== "false" });
    setTestDialogOpen(true);
  };
  const handleTestSave = async () => {
    if (!testForm.name.trim() || !testForm.text.trim()) { toast({ title: "Name and text required", variant: "destructive" }); return; }
    setSaving(true);
    const value = { ...testForm, visible: String(testForm.visible) };
    if (editingTest) {
      await supabase.from("site_content").update({ value, updated_at: new Date().toISOString() }).eq("id", editingTest.id);
      toast({ title: "Testimonial Updated" });
    } else {
      await supabase.from("site_content").insert({ section: "testimonials", key: `testimonial_${Date.now()}`, value });
      toast({ title: "Testimonial Added" });
    }
    setTestDialogOpen(false); setSaving(false); fetchContent();
  };

  // ---- Partners ----
  const openPartCreate = () => { setPartForm({ name: "", category: CATEGORIES[0] }); setPartLogoFile(null); setEditingPart(null); setPartDialogOpen(true); };
  const openPartEdit = (p: SiteContent) => {
    setEditingPart(p);
    setPartForm({ name: p.value.name || "", category: p.value.category || CATEGORIES[0] });
    setPartDialogOpen(true);
  };
  const handlePartSave = async () => {
    if (!partForm.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setSaving(true);
    let logoUrl = editingPart?.value.logo_url || "";
    if (partLogoFile) {
      setUploadingPartLogo(true);
      const path = await uploadImage(partLogoFile, "partners");
      if (path) logoUrl = path;
      setUploadingPartLogo(false);
    }
    const value = { ...partForm, logo_url: logoUrl };
    if (editingPart) {
      await supabase.from("site_content").update({ value, updated_at: new Date().toISOString() }).eq("id", editingPart.id);
      toast({ title: "Partner Updated" });
    } else {
      await supabase.from("site_content").insert({ section: "partners", key: partForm.name.toLowerCase().replace(/\s+/g, "_"), value });
      toast({ title: "Partner Added" });
    }
    setPartDialogOpen(false); setSaving(false); fetchContent();
  };

  // ---- Delete ----
  const openDeleteDialog = (id: string, name: string, table?: string) => { setDeleteTarget({ id, name, table }); setDeleteDialogOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const tbl = deleteTarget.table || "site_content";
    const { error } = await supabase.from(tbl as any).delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted", description: `${deleteTarget.name} has been removed.` }); fetchContent(); fetchHeroVideos(); }
    setDeleteDialogOpen(false); setDeleteTarget(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Content Management</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">Edit website content, hero slides, services, testimonials, and partners.</p>
        </div>

        <Tabs defaultValue="hero">
          <TabsList className="flex-wrap">
            <TabsTrigger value="hero"><SlidersHorizontal className="w-4 h-4 mr-1.5" />Hero Slider</TabsTrigger>
            <TabsTrigger value="pages"><Globe className="w-4 h-4 mr-1.5" />Pages</TabsTrigger>
            <TabsTrigger value="services"><PenTool className="w-4 h-4 mr-1.5" />Services</TabsTrigger>
            <TabsTrigger value="testimonials"><Star className="w-4 h-4 mr-1.5" />Testimonials</TabsTrigger>
            <TabsTrigger value="partners"><Handshake className="w-4 h-4 mr-1.5" />Partners</TabsTrigger>
          </TabsList>

          {/* Hero Slider Tab */}
          <TabsContent value="hero" className="space-y-4">
            {/* Hero Video */}
            <Card className="shadow-card mt-4 rounded-xl border border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2"><Video className="w-5 h-5 text-accent" /> Hero Background Video</CardTitle>
                  <CardDescription>Optional video that plays behind the first slide. Overrides the slide image.</CardDescription>
                </div>
                {heroVideos.length === 0 && (
                  <Button size="sm" onClick={openHeroVideoCreate}><Plus className="w-4 h-4 mr-1" />Add Video</Button>
                )}
              </CardHeader>
              <CardContent>
                {heroVideos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hero video set. The first slide image will be used as background.</p>
                ) : (
                  <div className="space-y-3">
                    {heroVideos.map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-4 rounded-lg border bg-background">
                        <div>
                          <p className="font-medium text-foreground">{v.title}</p>
                          <Badge variant="outline" className="mt-1">{v.video_type === "embed" ? "YouTube/Vimeo" : "Uploaded"}</Badge>
                          {v.video_url && <p className="text-xs text-muted-foreground mt-1 truncate max-w-[300px]">{v.video_url}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openHeroVideoEdit(v)}><PenTool className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog(v.id, v.title, "videos")}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hero Slides */}
            <Card className="shadow-card rounded-xl border border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-secondary" /> Hero Slides</CardTitle>
                  <CardDescription>Manage the sliding images, text, and CTAs on the homepage hero.</CardDescription>
                </div>
                <Button size="sm" onClick={openSlideCreate}><Plus className="w-4 h-4 mr-1" />Add Slide</Button>
              </CardHeader>
              <CardContent>
                {heroSlides.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                      <Inbox className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-[14px] font-semibold text-foreground">No slides yet</p>
                    <p className="text-[12px] text-muted-foreground mt-1">Default slides are being used. Add your own to customize.</p>
                    <Button size="sm" className="mt-3" onClick={openSlideCreate}><Plus className="w-4 h-4 mr-1" />Add Slide</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {heroSlides.map((slide, idx) => (
                      <div key={slide.id} className="flex items-center gap-4 p-4 rounded-lg border bg-background">
                        {/* Thumbnail */}
                        {slide.value.image_url ? (
                          <img src={getStorageUrl(slide.value.image_url) || ""} alt="" className="w-20 h-12 rounded object-cover border border-border shrink-0" />
                        ) : (
                          <div className="w-20 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {slide.value.title} <span className="text-accent font-bold">{slide.value.highlight}</span> {slide.value.title_end}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{slide.value.description}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">{slide.value.badge || "No badge"}</Badge>
                            <Badge variant={slide.value.active !== "false" ? "default" : "secondary"} className="text-[10px]">
                              {slide.value.active !== "false" ? "Active" : "Draft"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => moveSlide(idx, -1)}>
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === heroSlides.length - 1} onClick={() => moveSlide(idx, 1)}>
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openSlideEdit(slide)}><PenTool className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog(slide.id, slide.value.title || "Slide")}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            <Card className="shadow-card mt-4 rounded-xl border border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <CardDescription>Update your business contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="info@africanwaves.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+233 XX XXX XXXX" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={contactAddress} onChange={e => setContactAddress(e.target.value)} placeholder="Accra, Ghana" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Hours</Label>
                    <Input value={contactHours} onChange={e => setContactHours(e.target.value)} placeholder="Mon-Fri: 9AM-6PM" />
                  </div>
                </div>
                <Button onClick={saveContact} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Contact Info
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="shadow-card mt-4 rounded-xl border border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Services</CardTitle>
                  <CardDescription>Manage the services listed on the website.</CardDescription>
                </div>
                <Button size="sm" onClick={openSvcCreate}><Plus className="w-4 h-4 mr-1" />Add Service</Button>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3"><Inbox className="w-7 h-7 text-muted-foreground/40" /></div>
                    <p className="text-[14px] font-semibold text-foreground">No services yet</p>
                    <Button size="sm" className="mt-3" onClick={openSvcCreate}><Plus className="w-4 h-4 mr-1" />Add Service</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map(service => (
                      <div key={service.id} className="flex items-center justify-between p-4 rounded-lg border bg-background">
                        <div>
                          <p className="font-medium text-foreground">{service.value.title}</p>
                          <p className="text-sm text-muted-foreground">{service.value.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={service.value.active !== "false" ? "default" : "secondary"}>{service.value.active !== "false" ? "Active" : "Draft"}</Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openSvcEdit(service)}><PenTool className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog(service.id, service.value.title)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <Card className="shadow-card mt-4 rounded-xl border border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Testimonials</CardTitle>
                  <CardDescription>Manage customer testimonials.</CardDescription>
                </div>
                <Button size="sm" onClick={openTestCreate}><Plus className="w-4 h-4 mr-1" />Add Testimonial</Button>
              </CardHeader>
              <CardContent>
                {testimonials.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3"><Inbox className="w-7 h-7 text-muted-foreground/40" /></div>
                    <p className="text-[14px] font-semibold text-foreground">No testimonials yet</p>
                    <Button size="sm" className="mt-3" onClick={openTestCreate}><Plus className="w-4 h-4 mr-1" />Add Testimonial</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testimonials.map(t => (
                      <div key={t.id} className="p-4 rounded-lg border bg-background">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">{t.value.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">"{t.value.text}"</p>
                            <div className="flex items-center gap-1 mt-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < parseInt(t.value.rating || "5") ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={t.value.visible !== "false" ? "default" : "secondary"}>{t.value.visible !== "false" ? "Visible" : "Hidden"}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openTestEdit(t)}><PenTool className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog(t.id, t.value.name)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners">
            <Card className="shadow-card mt-4 rounded-xl border border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Partners</CardTitle>
                  <CardDescription>Manage partner logos and information.</CardDescription>
                </div>
                <Button size="sm" onClick={openPartCreate}><Plus className="w-4 h-4 mr-1" />Add Partner</Button>
              </CardHeader>
              <CardContent>
                {partners.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3"><Inbox className="w-7 h-7 text-muted-foreground/40" /></div>
                    <p className="text-[14px] font-semibold text-foreground">No partners yet</p>
                    <Button size="sm" className="mt-3" onClick={openPartCreate}><Plus className="w-4 h-4 mr-1" />Add Partner</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partners.map(p => (
                      <div key={p.id} className="p-4 rounded-lg border bg-background flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{p.value.name}</p>
                          <Badge variant="outline" className="mt-1">{p.value.category}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPartEdit(p)}><PenTool className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog(p.id, p.value.name)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Hero Slide Dialog */}
      <Dialog open={slideDialogOpen} onOpenChange={setSlideDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingSlide ? "Edit Slide" : "Add Slide"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Badge Label</Label>
              <Input value={slideForm.badge} onChange={e => setSlideForm(f => ({ ...f, badge: e.target.value }))} placeholder="e.g. Travel & Tours" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Title Start *</Label>
                <Input value={slideForm.title} onChange={e => setSlideForm(f => ({ ...f, title: e.target.value }))} placeholder="Your Gateway to" />
              </div>
              <div className="space-y-2">
                <Label>Highlight *</Label>
                <Input value={slideForm.highlight} onChange={e => setSlideForm(f => ({ ...f, highlight: e.target.value }))} placeholder="Global" />
              </div>
              <div className="space-y-2">
                <Label>Title End</Label>
                <Input value={slideForm.title_end} onChange={e => setSlideForm(f => ({ ...f, title_end: e.target.value }))} placeholder="Opportunities" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={slideForm.description} onChange={e => setSlideForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>CTA Label</Label>
                <Input value={slideForm.cta_label} onChange={e => setSlideForm(f => ({ ...f, cta_label: e.target.value }))} placeholder="Book a Flight" />
              </div>
              <div className="space-y-2">
                <Label>CTA Link</Label>
                <Input value={slideForm.cta_link} onChange={e => setSlideForm(f => ({ ...f, cta_link: e.target.value }))} placeholder="/travel/flights" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Secondary CTA Label</Label>
                <Input value={slideForm.cta_secondary_label} onChange={e => setSlideForm(f => ({ ...f, cta_secondary_label: e.target.value }))} placeholder="Explore" />
              </div>
              <div className="space-y-2">
                <Label>Secondary CTA Link</Label>
                <Input value={slideForm.cta_secondary_link} onChange={e => setSlideForm(f => ({ ...f, cta_secondary_link: e.target.value }))} placeholder="/travel" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Background Image</Label>
              <div className="flex items-center gap-3">
                {editingSlide?.value.image_url && (
                  <img src={getStorageUrl(editingSlide.value.image_url) || ""} alt="" className="w-16 h-10 object-cover rounded border" />
                )}
                <label className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 cursor-pointer hover:bg-muted transition-colors text-sm">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{slideImageFile ? slideImageFile.name : "Upload Image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setSlideImageFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={slideForm.active} onCheckedChange={v => setSlideForm(f => ({ ...f, active: v }))} />
              <Label>{slideForm.active ? "Active" : "Draft"}</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSlideSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingSlide ? "Save" : "Add Slide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hero Video Dialog */}
      <Dialog open={heroVideoDialogOpen} onOpenChange={setHeroVideoDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editingHeroVideo ? "Edit Hero Video" : "Add Hero Video"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={heroVideoForm.title} onChange={e => setHeroVideoForm(f => ({ ...f, title: e.target.value }))} placeholder="Hero Background Video" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={heroVideoForm.video_type} onValueChange={v => setHeroVideoForm(f => ({ ...f, video_type: v as "embed" | "upload" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="embed">YouTube/Vimeo URL</SelectItem>
                  <SelectItem value="upload">Upload Video File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {heroVideoForm.video_type === "embed" ? (
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input value={heroVideoForm.video_url} onChange={e => setHeroVideoForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Video File</Label>
                <Input type="file" accept="video/*" onChange={e => setHeroVideoFile(e.target.files?.[0] || null)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleHeroVideoSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingHeroVideo ? "Update" : "Add"} Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={svcDialogOpen} onOpenChange={setSvcDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editingSvc ? "Edit Service" : "Add Service"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Title *</Label><Input value={svcForm.title} onChange={e => setSvcForm(f => ({ ...f, title: e.target.value }))} placeholder="Service name" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={svcForm.description} onChange={e => setSvcForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" rows={2} /></div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={svcForm.icon} onValueChange={v => setSvcForm(f => ({ ...f, icon: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plane">Plane</SelectItem><SelectItem value="Globe">Globe</SelectItem><SelectItem value="Package">Package</SelectItem>
                  <SelectItem value="FileText">FileText</SelectItem><SelectItem value="Briefcase">Briefcase</SelectItem><SelectItem value="GraduationCap">GraduationCap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3"><Switch checked={svcForm.active} onCheckedChange={v => setSvcForm(f => ({ ...f, active: v }))} /><Label>{svcForm.active ? "Active" : "Draft"}</Label></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSvcSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingSvc ? "Save" : "Add Service"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editingTest ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Customer Name *</Label><Input value={testForm.name} onChange={e => setTestForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Testimonial Text *</Label><Textarea value={testForm.text} onChange={e => setTestForm(f => ({ ...f, text: e.target.value }))} placeholder="What did they say?" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={testForm.rating} onValueChange={v => setTestForm(f => ({ ...f, rating: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[5,4,3,2,1].map(r => <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="flex items-center gap-3 h-9"><Switch checked={testForm.visible} onCheckedChange={v => setTestForm(f => ({ ...f, visible: v }))} /><span className="text-sm">{testForm.visible ? "Visible" : "Hidden"}</span></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleTestSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingTest ? "Save" : "Add Testimonial"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partner Dialog */}
      <Dialog open={partDialogOpen} onOpenChange={setPartDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>{editingPart ? "Edit Partner" : "Add Partner"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Partner Name *</Label><Input value={partForm.name} onChange={e => setPartForm(f => ({ ...f, name: e.target.value }))} placeholder="Company name" /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={partForm.category} onValueChange={v => setPartForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Partner Logo</Label>
              <div className="flex items-center gap-3">
                {editingPart?.value.logo_url && <img src={getStorageUrl(editingPart.value.logo_url) || ""} alt="Logo" className="w-12 h-12 object-contain rounded border" />}
                <label className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 cursor-pointer hover:bg-muted transition-colors text-sm">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{partLogoFile ? partLogoFile.name : "Upload Logo"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setPartLogoFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handlePartSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingPart ? "Save" : "Add Partner"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? This action cannot be undone.
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

export default AdminContent;
