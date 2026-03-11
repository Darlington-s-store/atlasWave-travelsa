import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Map, Star, Search } from "lucide-react";

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string | null;
  image_url: string | null;
  category: string;
  price_from: number | null;
  currency: string;
  featured: boolean;
  active: boolean;
  highlights: string[];
  sort_order: number;
  created_at: string;
}

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", country: "", description: "", image_url: "", category: "travel",
    price_from: "", currency: "GHS", featured: false, active: true, highlights: "", sort_order: 0,
  });

  const fetchDestinations = async () => {
    setLoading(true);
    const { data } = await supabase.from("destinations").select("*").order("sort_order");
    setDestinations((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchDestinations(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", country: "", description: "", image_url: "", category: "travel", price_from: "", currency: "GHS", featured: false, active: true, highlights: "", sort_order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (d: Destination) => {
    setEditing(d);
    setForm({
      name: d.name, country: d.country, description: d.description || "",
      image_url: d.image_url || "", category: d.category, price_from: d.price_from?.toString() || "",
      currency: d.currency, featured: d.featured, active: d.active,
      highlights: d.highlights.join(", "), sort_order: d.sort_order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.country.trim()) {
      toast({ title: "Name and country are required", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name, country: form.country, description: form.description || null,
      image_url: form.image_url || null, category: form.category,
      price_from: form.price_from ? parseFloat(form.price_from) : null,
      currency: form.currency, featured: form.featured, active: form.active,
      highlights: form.highlights ? form.highlights.split(",").map(s => s.trim()).filter(Boolean) : [],
      sort_order: form.sort_order,
    };

    if (editing) {
      const { error } = await supabase.from("destinations").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Destination updated!" });
    } else {
      const { error } = await supabase.from("destinations").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Destination created!" });
    }
    setDialogOpen(false);
    fetchDestinations();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("destinations").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Destination deleted" });
    fetchDestinations();
  };

  const filtered = destinations.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Destinations</h1>
            <p className="text-sm text-muted-foreground">Manage travel destinations shown on the website</p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Destination</Button>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input className="bg-transparent border-none outline-none text-sm w-full" placeholder="Search destinations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-background rounded-xl border p-12 text-center">
            <Map className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-1">No destinations</h3>
            <p className="text-sm text-muted-foreground mb-4">Add travel destinations for users to explore.</p>
            <Button size="sm" onClick={openCreate}>Add Destination</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(d => (
              <div key={d.id} className="bg-background rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                {d.image_url && (
                  <div className="h-40 bg-muted">
                    <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{d.name}</h3>
                      <p className="text-xs text-muted-foreground">{d.country}</p>
                    </div>
                    <div className="flex gap-1">
                      {d.featured && <Badge variant="secondary" className="text-[10px]"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
                      {!d.active && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                    </div>
                  </div>
                  {d.description && <p className="text-xs text-muted-foreground line-clamp-2">{d.description}</p>}
                  {d.price_from && <p className="text-sm font-bold text-primary">From {d.currency} {d.price_from.toLocaleString()}</p>}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(d)}><Edit className="w-3 h-3 mr-1" />Edit</Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(d.id)}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Destination" : "Add Destination"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dubai" /></div>
                <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. UAE" /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
              <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>Price From</Label><Input type="number" value={form.price_from} onChange={e => setForm(f => ({ ...f, price_from: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} /></div>
              </div>
              <div className="space-y-2"><Label>Highlights (comma-separated)</Label><Input value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))} placeholder="Beach, Nightlife, Culture" /></div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} /><Label>Featured</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} /><Label>Active</Label></div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDestinations;
