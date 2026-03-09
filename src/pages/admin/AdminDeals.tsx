import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, Edit, Inbox, Loader2, Percent, Plus, Tag, Trash2 } from "lucide-react";

interface SiteDeal {
  id: string;
  key: string;
  value: Record<string, string>;
}

const emptyForm = {
  type: "Flight",
  title: "",
  original_price: "",
  price: "",
  discount: "",
  deadline: "",
  tag: "",
  sort_order: "0",
  active: true,
};

const AdminDeals = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deals, setDeals] = useState<SiteDeal[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<SiteDeal | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchDeals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_content")
      .select("id, key, value")
      .eq("section", "deals")
      .order("updated_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const items = ((data || []) as SiteDeal[]).sort(
        (a, b) => parseInt(a.value.sort_order || "0") - parseInt(b.value.sort_order || "0"),
      );
      setDeals(items);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const openCreate = () => {
    setEditingDeal(null);
    setForm({ ...emptyForm, sort_order: String(deals.length) });
    setDialogOpen(true);
  };

  const openEdit = (deal: SiteDeal) => {
    setEditingDeal(deal);
    setForm({
      type: deal.value.type || "Flight",
      title: deal.value.title || "",
      original_price: deal.value.original_price || "",
      price: deal.value.price || "",
      discount: deal.value.discount || "",
      deadline: deal.value.deadline || "",
      tag: deal.value.tag || "",
      sort_order: deal.value.sort_order || "0",
      active: deal.value.active !== "false",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.price.trim() || !form.original_price.trim()) {
      toast({ title: "Missing fields", description: "Title, current price, and original price are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const value = { ...form, active: String(form.active) };

    if (editingDeal) {
      const { error } = await supabase
        .from("site_content")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", editingDeal.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Deal updated" });
      }
    } else {
      const key = `deal_${Date.now()}`;
      const { error } = await supabase.from("site_content").insert({ section: "deals", key, value });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Deal added" });
      }
    }

    setSaving(false);
    setDialogOpen(false);
    fetchDeals();
  };

  const handleDelete = async (deal: SiteDeal) => {
    const { error } = await supabase.from("site_content").delete().eq("id", deal.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deal deleted" });
      fetchDeals();
    }
  };

  const activeDeals = deals.filter((deal) => deal.value.active !== "false").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Deals & Packages</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">Manage the featured deals shown on the homepage.</p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Deal
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Total Deals</p>
              <p className="text-3xl font-bold text-foreground mt-2">{deals.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Active</p>
              <p className="text-3xl font-bold text-foreground mt-2">{activeDeals}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Currency</p>
              <p className="text-3xl font-bold text-foreground mt-2">GHs</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card rounded-xl border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Homepage Deals</CardTitle>
              <CardDescription>These entries power the featured deals section on the homepage.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
              </div>
            ) : deals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <Inbox className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-[14px] font-semibold text-foreground">No deals yet</p>
                <Button size="sm" className="mt-3" onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Deal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="rounded-xl border bg-background p-4 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{deal.value.type}</Badge>
                        <Badge variant={deal.value.active !== "false" ? "default" : "secondary"}>
                          {deal.value.active !== "false" ? "Active" : "Draft"}
                        </Badge>
                        {deal.value.discount && (
                          <span className="inline-flex items-center gap-1 text-xs text-secondary font-semibold">
                            <Percent className="w-3.5 h-3.5" />
                            {deal.value.discount}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground">{deal.value.title}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-accent">{deal.value.price}</span>
                        <span className="text-sm text-muted-foreground line-through">{deal.value.original_price}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {deal.value.tag || "Deal"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="w-3.5 h-3.5" />
                          {deal.value.deadline || "No deadline"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(deal)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(deal)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingDeal ? "Edit Deal" : "Add Deal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flight">Flight</SelectItem>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tag</Label>
                <Input value={form.tag} onChange={(e) => setForm((prev) => ({ ...prev, tag: e.target.value }))} placeholder="Hot Deal" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Accra -> London Return" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Current Price</Label>
                <Input value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="GHs 9,865" />
              </div>
              <div className="space-y-2">
                <Label>Original Price</Label>
                <Input value={form.original_price} onChange={(e) => setForm((prev) => ({ ...prev, original_price: e.target.value }))} placeholder="GHs 13,530" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input value={form.discount} onChange={(e) => setForm((prev) => ({ ...prev, discount: e.target.value }))} placeholder="27% OFF" />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input value={form.deadline} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} placeholder="2026-04-15T00:00:00" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingDeal ? "Save Changes" : "Add Deal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDeals;
