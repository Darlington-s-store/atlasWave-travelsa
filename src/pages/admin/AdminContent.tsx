import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PenTool, Globe, Star, Handshake, Save, Plus, Trash2 } from "lucide-react";

const mockServices = [
  { id: "1", name: "Work Permits", description: "International work permit assistance", active: true },
  { id: "2", name: "Travel Services", description: "Flight and hotel booking", active: true },
  { id: "3", name: "Logistics", description: "Shipping and cargo services", active: true },
  { id: "4", name: "Credential Evaluation", description: "Foreign credential assessment", active: false },
];

const mockTestimonials = [
  { id: "1", name: "Sarah Johnson", text: "Excellent service and support throughout my visa process.", rating: 5, visible: true },
  { id: "2", name: "Michael Chen", text: "Very professional team. Highly recommended.", rating: 4, visible: true },
  { id: "3", name: "Fatima Al-Hassan", text: "Smooth logistics handling for my shipment.", rating: 5, visible: false },
];

const mockPartners = [
  { id: "1", name: "Lufthansa Airlines", category: "Travel" },
  { id: "2", name: "DHL Logistics", category: "Logistics" },
  { id: "3", name: "German Embassy", category: "Government" },
];

const AdminContent = () => {
  const [heroTitle, setHeroTitle] = useState("Your Gateway to Global Opportunities");
  const [heroSubtitle, setHeroSubtitle] = useState("Professional immigration, travel, and logistics services");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Content Management</h2>
          <p className="text-muted-foreground mt-1">Edit website content, services, testimonials, and partner information.</p>
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
            <Card className="shadow-card mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Homepage Hero Section</CardTitle>
                <CardDescription>Edit the main headline and subtitle visible on the homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} rows={2} />
                </div>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="shadow-card mt-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Services</CardTitle>
                  <CardDescription>Manage the services listed on the website.</CardDescription>
                </div>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Service</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockServices.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                      <div>
                        <p className="font-medium text-foreground">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={service.active ? "default" : "secondary"}>
                          {service.active ? "Active" : "Draft"}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><PenTool className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <Card className="shadow-card mt-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Testimonials</CardTitle>
                  <CardDescription>Manage customer testimonials displayed on the site.</CardDescription>
                </div>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Testimonial</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTestimonials.map(t => (
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
                          <Button variant="ghost" size="icon" className="h-8 w-8"><PenTool className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners">
            <Card className="shadow-card mt-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Partners</CardTitle>
                  <CardDescription>Manage partner logos and information.</CardDescription>
                </div>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Partner</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockPartners.map(p => (
                    <div key={p.id} className="p-4 rounded-lg border border-border bg-background flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <Badge variant="outline" className="mt-1">{p.category}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><PenTool className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
