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
import { PenTool, Globe, Star, Handshake, Save, Plus, Trash2, Inbox, Loader2, Upload, ImageIcon } from "lucide-react";
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

const AdminContent = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SiteContent[]>([]);

  // Hero form state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroCtaText, setHeroCtaText] = useState("");
  const [heroCtaLink, setHeroCtaLink] = useState("");
  const [heroId, setHeroId] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);

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
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchContent();
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

      // Parse hero content
      const hero = items.find(i => i.section === "hero" && i.key === "main");
      if (hero) {
        setHeroId(hero.id);
        setHeroTitle(hero.value.title || "");
        setHeroSubtitle(hero.value.subtitle || "");
        setHeroCtaText(hero.value.cta_text || "");
        setHeroCtaLink(hero.value.cta_link || "");
        setHeroImageUrl(hero.value.image_url || "");
      }

      // Parse contact content
      const contact = items.find(i => i.section === "contact" && i.key === "info");
      if (contact) {
        setContactId(contact.id);
        setContactEmail(contact.value.email || "");
        setContactPhone(contact.value.phone || "");
        setContactAddress(contact.value.address || "");
        setContactHours(contact.value.hours || "");
      }

      // Parse services
      setServices(items.filter(i => i.section === "services"));

      // Parse testimonials
      setTestimonials(items.filter(i => i.section === "testimonials"));

      // Parse partners
      setPartners(items.filter(i => i.section === "partners"));
    }
    setLoading(false);
  };

  const saveHero = async () => {
    setSaving(true);
    let imageUrl = heroImageUrl;
    
    // Upload hero image if a new file was selected
    const heroFileInput = document.getElementById("hero-image-input") as HTMLInputElement;
    if (heroFileInput?.files?.[0]) {
      setUploadingHeroImage(true);
      const path = await uploadImage(heroFileInput.files[0], "hero");
      if (path) imageUrl = path;
      setUploadingHeroImage(false);
      heroFileInput.value = "";
    }
    
    const value = { title: heroTitle, subtitle: heroSubtitle, cta_text: heroCtaText, cta_link: heroCtaLink, image_url: imageUrl };
    
    if (heroId) {
      const { error } = await supabase
        .from("site_content")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", heroId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Saved", description: "Hero section updated." });
      }
    } else {
      const { error } = await supabase
        .from("site_content")
        .insert({ section: "hero", key: "main", value });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Saved", description: "Hero section created." });
        fetchContent();
      }
    }
    setSaving(false);
  };

  const saveContact = async () => {
    setSaving(true);
    const value = { email: contactEmail, phone: contactPhone, address: contactAddress, hours: contactHours };
    
    if (contactId) {
      const { error } = await supabase
        .from("site_content")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", contactId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Saved", description: "Contact info updated." });
      }
    } else {
      const { error } = await supabase
        .from("site_content")
        .insert({ section: "contact", key: "info", value });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Saved", description: "Contact info created." });
        fetchContent();
      }
    }
    setSaving(false);
  };

  // Service handlers
  const openSvcCreate = () => {
    setSvcForm({ title: "", description: "", icon: "FileText", active: true });
    setEditingSvc(null);
    setSvcDialogOpen(true);
  };

  const openSvcEdit = (s: SiteContent) => {
    setEditingSvc(s);
    setSvcForm({
      title: s.value.title || "",
      description: s.value.description || "",
      icon: s.value.icon || "FileText",
      active: s.value.active !== "false",
    });
    setSvcDialogOpen(true);
  };

  const handleSvcSave = async () => {
    if (!svcForm.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const value = { ...svcForm, active: String(svcForm.active) };
    
    if (editingSvc) {
      const { error } = await supabase
        .from("site_content")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", editingSvc.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Service Updated" });
        fetchContent();
      }
    } else {
      const key = svcForm.title.toLowerCase().replace(/\s+/g, "_");
      const { error } = await supabase
        .from("site_content")
        .insert({ section: "services", key, value });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Service Added" });
        fetchContent();
      }
    }
    setSvcDialogOpen(false);
    setSaving(false);
  };

  // Testimonial handlers
  const openTestCreate = () => {
    setTestForm({ name: "", text: "", rating: "5", visible: true });
    setEditingTest(null);
    setTestDialogOpen(true);
  };

  const openTestEdit = (t: SiteContent) => {
    setEditingTest(t);
    setTestForm({
      name: t.value.name || "",
      text: t.value.text || "",
      rating: t.value.rating || "5",
      visible: t.value.visible !== "false",
    });
    setTestDialogOpen(true);
  };

  const handleTestSave = async () => {
    if (!testForm.name.trim() || !testForm.text.trim()) {
      toast({ title: "Name and text required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const value = { ...testForm, visible: String(testForm.visible) };
    
    if (editingTest) {
      const { error } = await supabase
        .from("site_content")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", editingTest.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Testimonial Updated" });
        fetchContent();
      }
    } else {
      const key = `testimonial_${Date.now()}`;
      const { error } = await supabase
        .from("site_content")
        .insert({ section: "testimonials", key, value });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Testimonial Added" });
        fetchContent();
      }
    }
    setTestDialogOpen(false);
    setSaving(false);
  };

  // Partner handlers
  const openPartCreate = () => {
    setPartForm({ name: "", category: CATEGORIES[0] });
    setPartLogoFile(null);
    setEditingPart(null);
    setPartDialogOpen(true);
  };

  const openPartEdit = (p: SiteContent) => {
    setEditingPart(p);
    setPartForm({
      name: p.value.name || "",
      category: p.value.category || CATEGORIES[0],
    });
    setPartDialogOpen(true);
  };

  const handlePartSave = async () => {
    if (!partForm.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
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
      const { error } = await supabase
        .from("site_content")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", editingPart.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Partner Updated" });
        fetchContent();
      }
    } else {
      const key = partForm.name.toLowerCase().replace(/\s+/g, "_");
      const { error } = await supabase
        .from("site_content")
        .insert({ section: "partners", key, value });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Partner Added" });
        fetchContent();
      }
    }
    setPartDialogOpen(false);
    setSaving(false);
  };

  // Delete handler
  const openDeleteDialog = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("site_content")
      .delete()
      .eq("id", deleteTarget.id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: `${deleteTarget.name} has been removed.` });
      fetchContent();
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
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
          <p className="text-muted-foreground text-[13px] mt-0.5">Edit website content, services, testimonials, and partners.</p>
        </div>

        <Tabs defaultValue="pages">
          <TabsList className="flex-wrap">
            <TabsTrigger value="pages"><Globe className="w-4 h-4 mr-1.5" />Pages</TabsTrigger>
            <TabsTrigger value="services"><PenTool className="w-4 h-4 mr-1.5" />Services</TabsTrigger>
            <TabsTrigger value="testimonials"><Star className="w-4 h-4 mr-1.5" />Testimonials</TabsTrigger>
            <TabsTrigger value="partners"><Handshake className="w-4 h-4 mr-1.5" />Partners</TabsTrigger>
          </TabsList>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            <Card className="shadow-card mt-4 rounded-xl border border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Homepage Hero Section</CardTitle>
                <CardDescription>Edit the main headline and call-to-action.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hero Title</Label>
                    <Input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} placeholder="Your Gateway to Global Opportunities" />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input value={heroCtaText} onChange={e => setHeroCtaText(e.target.value)} placeholder="Get Started" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} rows={2} placeholder="Professional immigration, travel, and logistics services" />
                </div>
                <div className="space-y-2">
                  <Label>CTA Link</Label>
                  <Input value={heroCtaLink} onChange={e => setHeroCtaLink(e.target.value)} placeholder="/consultation" />
                </div>
                <Button onClick={saveHero} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card rounded-xl border border-border/60">
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
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                      <Inbox className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-[14px] font-semibold text-foreground">No services yet</p>
                    <p className="text-[12px] text-muted-foreground mt-1">Add your first service to get started.</p>
                    <Button size="sm" className="mt-3" onClick={openSvcCreate}><Plus className="w-4 h-4 mr-1" />Add Service</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map(service => (
                      <div key={service.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                        <div>
                          <p className="font-medium text-foreground">{service.value.title}</p>
                          <p className="text-sm text-muted-foreground">{service.value.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={service.value.active !== "false" ? "default" : "secondary"}>
                            {service.value.active !== "false" ? "Active" : "Draft"}
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openSvcEdit(service)}>
                            <PenTool className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(service.id, service.value.title)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                      <Inbox className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-[14px] font-semibold text-foreground">No testimonials yet</p>
                    <p className="text-[12px] text-muted-foreground mt-1">Add your first testimonial to display on the site.</p>
                    <Button size="sm" className="mt-3" onClick={openTestCreate}><Plus className="w-4 h-4 mr-1" />Add Testimonial</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testimonials.map(t => (
                      <div key={t.id} className="p-4 rounded-lg border border-border bg-background">
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
                            <Badge variant={t.value.visible !== "false" ? "default" : "secondary"}>
                              {t.value.visible !== "false" ? "Visible" : "Hidden"}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openTestEdit(t)}>
                              <PenTool className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(t.id, t.value.name)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                      <Inbox className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-[14px] font-semibold text-foreground">No partners yet</p>
                    <p className="text-[12px] text-muted-foreground mt-1">Add your first partner to display on the site.</p>
                    <Button size="sm" className="mt-3" onClick={openPartCreate}><Plus className="w-4 h-4 mr-1" />Add Partner</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partners.map(p => (
                      <div key={p.id} className="p-4 rounded-lg border border-border bg-background flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{p.value.name}</p>
                          <Badge variant="outline" className="mt-1">{p.value.category}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPartEdit(p)}>
                            <PenTool className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(p.id, p.value.name)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Service Dialog */}
      <Dialog open={svcDialogOpen} onOpenChange={setSvcDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editingSvc ? "Edit Service" : "Add Service"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={svcForm.title} onChange={e => setSvcForm(f => ({ ...f, title: e.target.value }))} placeholder="Service name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={svcForm.description} onChange={e => setSvcForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={svcForm.icon} onValueChange={v => setSvcForm(f => ({ ...f, icon: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plane">Plane</SelectItem>
                  <SelectItem value="Globe">Globe</SelectItem>
                  <SelectItem value="Package">Package</SelectItem>
                  <SelectItem value="FileText">FileText</SelectItem>
                  <SelectItem value="Briefcase">Briefcase</SelectItem>
                  <SelectItem value="GraduationCap">GraduationCap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={svcForm.active} onCheckedChange={v => setSvcForm(f => ({ ...f, active: v }))} />
              <Label>{svcForm.active ? "Active" : "Draft"}</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSvcSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingSvc ? "Save" : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editingTest ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Customer Name *</Label>
              <Input value={testForm.name} onChange={e => setTestForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Testimonial Text *</Label>
              <Textarea value={testForm.text} onChange={e => setTestForm(f => ({ ...f, text: e.target.value }))} placeholder="What did they say?" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={testForm.rating} onValueChange={v => setTestForm(f => ({ ...f, rating: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map(r => (
                      <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="flex items-center gap-3 h-9">
                  <Switch checked={testForm.visible} onCheckedChange={v => setTestForm(f => ({ ...f, visible: v }))} />
                  <span className="text-sm">{testForm.visible ? "Visible" : "Hidden"}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleTestSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingTest ? "Save" : "Add Testimonial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partner Dialog */}
      <Dialog open={partDialogOpen} onOpenChange={setPartDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>{editingPart ? "Edit Partner" : "Add Partner"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Partner Name *</Label>
              <Input value={partForm.name} onChange={e => setPartForm(f => ({ ...f, name: e.target.value }))} placeholder="Company name" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={partForm.category} onValueChange={v => setPartForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handlePartSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingPart ? "Save" : "Add Partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
