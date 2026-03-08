import { useState } from "react";
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
import { PenTool, Globe, Star, Handshake, Save, Plus, Trash2, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Service { id: string; name: string; description: string; active: boolean; }
interface Testimonial { id: string; name: string; text: string; rating: number; visible: boolean; }
interface Partner { id: string; name: string; category: string; }

const CATEGORIES = ["Travel", "Logistics", "Government", "Education", "Finance"];

let svcId = 1, testId = 1, partId = 1;

const AdminContent = () => {
  const { toast } = useToast();
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");

  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  // Service dialog
  const [svcDialogOpen, setSvcDialogOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState<Service | null>(null);
  const [svcForm, setSvcForm] = useState({ name: "", description: "", active: true });

  // Testimonial dialog
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Testimonial | null>(null);
  const [testForm, setTestForm] = useState({ name: "", text: "", rating: "5", visible: true });

  // Partner dialog
  const [partDialogOpen, setPartDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Partner | null>(null);
  const [partForm, setPartForm] = useState({ name: "", category: CATEGORIES[0] });

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  const openDeleteDialog = (type: string, id: string, name: string) => { setDeleteTarget({ type, id, name }); setDeleteDialogOpen(true); };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "service") setServices(prev => prev.filter(s => s.id !== deleteTarget.id));
    if (deleteTarget.type === "testimonial") setTestimonials(prev => prev.filter(t => t.id !== deleteTarget.id));
    if (deleteTarget.type === "partner") setPartners(prev => prev.filter(p => p.id !== deleteTarget.id));
    toast({ title: "Deleted", description: `${deleteTarget.name} has been removed.` });
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  // Service handlers
  const openSvcCreate = () => { setSvcForm({ name: "", description: "", active: true }); setEditingSvc(null); setSvcDialogOpen(true); };
  const openSvcEdit = (s: Service) => { setEditingSvc(s); setSvcForm({ name: s.name, description: s.description, active: s.active }); setSvcDialogOpen(true); };
  const handleSvcSave = () => {
    if (!svcForm.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (editingSvc) {
      setServices(prev => prev.map(s => s.id === editingSvc.id ? { ...s, ...svcForm } : s));
      toast({ title: "Service Updated" });
    } else {
      setServices(prev => [...prev, { id: String(svcId++), ...svcForm }]);
      toast({ title: "Service Added" });
    }
    setSvcDialogOpen(false);
  };

  // Testimonial handlers
  const openTestCreate = () => { setTestForm({ name: "", text: "", rating: "5", visible: true }); setEditingTest(null); setTestDialogOpen(true); };
  const openTestEdit = (t: Testimonial) => { setEditingTest(t); setTestForm({ name: t.name, text: t.text, rating: String(t.rating), visible: t.visible }); setTestDialogOpen(true); };
  const handleTestSave = () => {
    if (!testForm.name.trim() || !testForm.text.trim()) { toast({ title: "Name and text required", variant: "destructive" }); return; }
    const data = { name: testForm.name, text: testForm.text, rating: parseInt(testForm.rating), visible: testForm.visible };
    if (editingTest) {
      setTestimonials(prev => prev.map(t => t.id === editingTest.id ? { ...t, ...data } : t));
      toast({ title: "Testimonial Updated" });
    } else {
      setTestimonials(prev => [...prev, { id: String(testId++), ...data }]);
      toast({ title: "Testimonial Added" });
    }
    setTestDialogOpen(false);
  };

  // Partner handlers
  const openPartCreate = () => { setPartForm({ name: "", category: CATEGORIES[0] }); setEditingPart(null); setPartDialogOpen(true); };
  const openPartEdit = (p: Partner) => { setEditingPart(p); setPartForm({ name: p.name, category: p.category }); setPartDialogOpen(true); };
  const handlePartSave = () => {
    if (!partForm.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (editingPart) {
      setPartners(prev => prev.map(p => p.id === editingPart.id ? { ...p, ...partForm } : p));
      toast({ title: "Partner Updated" });
    } else {
      setPartners(prev => [...prev, { id: String(partId++), ...partForm }]);
      toast({ title: "Partner Added" });
    }
    setPartDialogOpen(false);
  };

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
          <TabsContent value="pages">
            <Card className="shadow-card mt-4 rounded-xl border border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Homepage Hero Section</CardTitle>
                <CardDescription>Edit the main headline and subtitle.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} placeholder="Your Gateway to Global Opportunities" />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} rows={2} placeholder="Professional immigration, travel, and logistics services" />
                </div>
                <Button onClick={() => toast({ title: "Saved", description: "Hero section updated." })}>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
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
                          <p className="font-medium text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={service.active ? "default" : "secondary"}>{service.active ? "Active" : "Draft"}</Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openSvcEdit(service)}><PenTool className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog("service", service.id, service.name)}><Trash2 className="w-4 h-4" /></Button>
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
                            <p className="font-medium text-foreground">{t.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">"{t.text}"</p>
                            <div className="flex items-center gap-1 mt-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={t.visible ? "default" : "secondary"}>{t.visible ? "Visible" : "Hidden"}</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openTestEdit(t)}><PenTool className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog("testimonial", t.id, t.name)}><Trash2 className="w-4 h-4" /></Button>
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
                          <p className="font-medium text-foreground">{p.name}</p>
                          <Badge variant="outline" className="mt-1">{p.category}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openPartEdit(p)}><PenTool className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog("partner", p.id, p.name)}><Trash2 className="w-4 h-4" /></Button>
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
            <div className="space-y-2"><Label>Name *</Label><Input value={svcForm.name} onChange={e => setSvcForm(f => ({ ...f, name: e.target.value }))} placeholder="Service name" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={svcForm.description} onChange={e => setSvcForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" rows={2} /></div>
            <div className="flex items-center gap-3">
              <Switch checked={svcForm.active} onCheckedChange={v => setSvcForm(f => ({ ...f, active: v }))} />
              <Label>{svcForm.active ? "Active" : "Draft"}</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSvcSave}>{editingSvc ? "Save" : "Add Service"}</Button>
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
                  <SelectContent>{["5","4","3","2","1"].map(r => <SelectItem key={r} value={r}>{r} Star{r !== "1" ? "s" : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={testForm.visible} onCheckedChange={v => setTestForm(f => ({ ...f, visible: v }))} />
                <Label>{testForm.visible ? "Visible" : "Hidden"}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleTestSave}>{editingTest ? "Save" : "Add Testimonial"}</Button>
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
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handlePartSave}>{editingPart ? "Save" : "Add Partner"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-[13px] text-muted-foreground py-2">
            Are you sure you want to delete <span className="font-bold text-foreground">{deleteTarget?.name}</span>? This cannot be undone.
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
