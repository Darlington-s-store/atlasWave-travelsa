import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Pencil, Inbox, Users, Shield, UserMinus, ArrowLeft, FileText, CreditCard, Calendar, Package, Mail, Phone, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency";

interface UserRow {
  id: string;
  email?: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
}

const ASSIGNABLE_ROLES = ["admin", "moderator", "user"] as const;

const roleColor = (r: string) => {
  if (r === "admin") return "bg-destructive/15 text-destructive";
  if (r === "moderator") return "bg-primary/10 text-primary";
  return "bg-secondary/15 text-secondary";
};

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Detail view
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [userPayments, setUserPayments] = useState<any[]>([]);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [userConsultations, setUserConsultations] = useState<any[]>([]);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [userShipments, setUserShipments] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [managingUser, setManagingUser] = useState<UserRow | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [editForm, setEditForm] = useState({ full_name: "", phone: "" });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
      const roleMap: Record<string, string[]> = {};
      (allRoles || []).forEach(r => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });
      setUsers((profiles || []).map(p => ({
        id: p.id, full_name: p.full_name, phone: p.phone,
        avatar_url: p.avatar_url, created_at: p.created_at, updated_at: p.updated_at,
        roles: roleMap[p.id] || ["user"],
      })));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const openUserDetail = async (user: UserRow) => {
    setSelectedUser(user);
    setDetailLoading(true);
    try {
      const [apps, payments, bookings, consultations, documents, shipments] = await Promise.all([
        supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("consultations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("shipments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setUserApplications(apps.data || []);
      setUserPayments(payments.data || []);
      setUserBookings(bookings.data || []);
      setUserConsultations(consultations.data || []);
      setUserDocuments(documents.data || []);
      setUserShipments(shipments.data || []);
    } catch (err: any) {
      toast({ title: "Error loading user data", description: err.message, variant: "destructive" });
    } finally { setDetailLoading(false); }
  };

  const handleAssignRole = async () => {
    if (!managingUser) return;
    const { data: existing } = await supabase.from("user_roles").select("id")
      .eq("user_id", managingUser.id).eq("role", selectedRole as any);
    if (existing && existing.length > 0) {
      toast({ title: "Role already assigned" }); setRoleDialogOpen(false); return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: managingUser.id, role: selectedRole as any });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Role Assigned" }); setRoleDialogOpen(false); fetchUsers();
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Role Removed" }); fetchUsers();
  };

  const handleEditUser = async () => {
    if (!managingUser) return;
    const { error } = await supabase.from("profiles").update({
      full_name: editForm.full_name || null, phone: editForm.phone || null,
    }).eq("id", managingUser.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Profile Updated" }); setEditDialogOpen(false); fetchUsers();
    if (selectedUser?.id === managingUser.id) {
      setSelectedUser({ ...selectedUser, full_name: editForm.full_name, phone: editForm.phone });
    }
  };

  const filtered = users.filter(u => {
    const matchesSearch = (u.full_name || "").toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  // Full detail view for a selected user
  if (selectedUser) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">
                {selectedUser.full_name || "Unnamed User"}
              </h2>
              <p className="text-muted-foreground text-[13px]">User ID: {selectedUser.id}</p>
            </div>
          </div>

          {/* Profile Info Card */}
          <Card className="shadow-card rounded-xl border border-border/60">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                  ) : (
                    (selectedUser.full_name || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Full Name</p>
                      <p className="text-[14px] font-semibold text-foreground">{selectedUser.full_name || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Phone</p>
                      <p className="text-[14px] font-semibold text-foreground">{selectedUser.phone || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Joined</p>
                      <p className="text-[14px] font-semibold text-foreground">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Roles</p>
                      <div className="flex gap-1 mt-0.5">{selectedUser.roles.map(r => <span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${roleColor(r)}`}>{r}</span>)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Last Updated</p>
                      <p className="text-[14px] font-semibold text-foreground">{new Date(selectedUser.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => { setManagingUser(selectedUser); setEditForm({ full_name: selectedUser.full_name || "", phone: selectedUser.phone || "" }); setEditDialogOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setManagingUser(selectedUser); setSelectedRole("user"); setRoleDialogOpen(true); }}>
                    <Shield className="w-3.5 h-3.5 mr-1" /> Roles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Tabs */}
          {detailLoading ? (
            <Card className="shadow-card rounded-xl border border-border/60"><CardContent className="p-8 text-center text-muted-foreground">Loading user activity...</CardContent></Card>
          ) : (
            <Tabs defaultValue="applications" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="applications">Applications ({userApplications.length})</TabsTrigger>
                <TabsTrigger value="bookings">Bookings ({userBookings.length})</TabsTrigger>
                <TabsTrigger value="consultations">Consultations ({userConsultations.length})</TabsTrigger>
                <TabsTrigger value="payments">Payments ({userPayments.length})</TabsTrigger>
                <TabsTrigger value="shipments">Shipments ({userShipments.length})</TabsTrigger>
                <TabsTrigger value="documents">Documents ({userDocuments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="applications">
                <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
                  <CardContent className="p-0">
                    {userApplications.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">No applications found.</div>
                    ) : (
                      <Table>
                        <TableHeader><TableRow className="bg-muted/30"><TableHead className="text-[11px] uppercase tracking-wider font-bold">Title</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Type</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {userApplications.map(a => (
                            <TableRow key={a.id}><TableCell className="font-medium text-[13px]">{a.title}</TableCell><TableCell className="text-[13px] text-muted-foreground">{a.type}</TableCell><TableCell><Badge variant="outline" className="capitalize text-[10px]">{a.status}</Badge></TableCell><TableCell className="text-[13px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell></TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings">
                <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
                  <CardContent className="p-0">
                    {userBookings.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">No bookings found.</div>
                    ) : (
                      <Table>
                        <TableHeader><TableRow className="bg-muted/30"><TableHead className="text-[11px] uppercase tracking-wider font-bold">Type</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Route</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Provider</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {userBookings.map(b => (
                            <TableRow key={b.id}><TableCell className="font-medium text-[13px] capitalize">{b.type}</TableCell><TableCell className="text-[13px]">{b.route}</TableCell><TableCell className="text-[13px] text-muted-foreground">{b.date}</TableCell><TableCell className="text-[13px] text-muted-foreground">{b.provider || "—"}</TableCell><TableCell><Badge variant="outline" className="capitalize text-[10px]">{b.status}</Badge></TableCell></TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="consultations">
                <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
                  <CardContent className="p-0">
                    {userConsultations.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">No consultations found.</div>
                    ) : (
                      <Table>
                        <TableHeader><TableRow className="bg-muted/30"><TableHead className="text-[11px] uppercase tracking-wider font-bold">Type</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Date & Time</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Duration</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Price</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {userConsultations.map(c => (
                            <TableRow key={c.id}><TableCell className="font-medium text-[13px] capitalize">{c.type}</TableCell><TableCell className="text-[13px]">{c.date} · {c.time}</TableCell><TableCell className="text-[13px] text-muted-foreground">{c.duration} min</TableCell><TableCell className="text-[13px] font-bold">{formatCurrency(Number(c.price), DEFAULT_CURRENCY)}</TableCell><TableCell><Badge variant="outline" className="capitalize text-[10px]">{c.status}</Badge></TableCell></TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments">
                <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
                  <CardContent className="p-0">
                    {userPayments.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">No payments found.</div>
                    ) : (
                      <Table>
                        <TableHeader><TableRow className="bg-muted/30"><TableHead className="text-[11px] uppercase tracking-wider font-bold">Description</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Amount</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Method</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Date</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {userPayments.map(p => (
                            <TableRow key={p.id}><TableCell className="font-medium text-[13px]">{p.description || "—"}</TableCell><TableCell className="text-[13px] font-bold">{formatCurrency(Number(p.amount), p.currency || DEFAULT_CURRENCY)}</TableCell><TableCell className="text-[13px] text-muted-foreground capitalize">{p.payment_method || "—"}</TableCell><TableCell><Badge variant="outline" className="capitalize text-[10px]">{p.status}</Badge></TableCell><TableCell className="text-[13px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell></TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipments">
                <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
                  <CardContent className="p-0">
                    {userShipments.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">No shipments found.</div>
                    ) : (
                      <Table>
                        <TableHeader><TableRow className="bg-muted/30"><TableHead className="text-[11px] uppercase tracking-wider font-bold">Tracking #</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Origin → Dest</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Progress</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">ETA</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {userShipments.map(s => (
                            <TableRow key={s.id}><TableCell className="font-mono text-[12px]">{s.tracking_number}</TableCell><TableCell className="text-[13px]">{s.origin} → {s.destination}</TableCell><TableCell><Badge variant="outline" className="capitalize text-[10px]">{s.status}</Badge></TableCell><TableCell className="text-[13px]">{s.progress}%</TableCell><TableCell className="text-[13px] text-muted-foreground">{s.eta || "—"}</TableCell></TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
                  <CardContent className="p-0">
                    {userDocuments.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-[13px]">No documents found.</div>
                    ) : (
                      <Table>
                        <TableHeader><TableRow className="bg-muted/30"><TableHead className="text-[11px] uppercase tracking-wider font-bold">Name</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Category</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Type</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Size</TableHead><TableHead className="text-[11px] uppercase tracking-wider font-bold">Uploaded</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {userDocuments.map(d => (
                            <TableRow key={d.id}><TableCell className="font-medium text-[13px]">{d.name}</TableCell><TableCell className="text-[13px] capitalize">{d.category}</TableCell><TableCell className="text-[13px] text-muted-foreground">{d.file_type}</TableCell><TableCell className="text-[13px] text-muted-foreground">{d.file_size || "—"}</TableCell><TableCell className="text-[13px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell></TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader><DialogTitle>Edit User Profile</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Full Name</Label><Input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleEditUser}>Save Changes</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Assignment Dialog */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader><DialogTitle>Manage Roles</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Current Roles</p>
                <div className="flex gap-1 flex-wrap">
                  {managingUser?.roles.map(r => (
                    <div key={r} className="flex items-center gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${roleColor(r)}`}>{r}</span>
                      {r !== "user" && <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { handleRemoveRole(managingUser.id, r); setManagingUser({ ...managingUser, roles: managingUser.roles.filter(x => x !== r) }); }}><UserMinus className="w-3 h-3 text-destructive" /></Button>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Add Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ASSIGNABLE_ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleAssignRole}>Assign Role</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    );
  }

  // User list view
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">User Management</h2>
          <p className="text-muted-foreground text-[13px] mt-0.5">View and manage all registered users and their roles.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users.length, icon: Users, bg: "bg-primary/10", color: "text-primary" },
            { label: "Admins", value: users.filter(u => u.roles.includes("admin")).length, icon: Shield, bg: "bg-destructive/10", color: "text-destructive" },
            { label: "Moderators", value: users.filter(u => u.roles.includes("moderator")).length, icon: Shield, bg: "bg-primary/10", color: "text-primary" },
            { label: "Regular Users", value: users.filter(u => !u.roles.includes("admin") && !u.roles.includes("moderator")).length, icon: Users, bg: "bg-secondary/15", color: "text-secondary" },
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px] h-9 text-[13px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ASSIGNABLE_ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-[13px]">Loading users...</p></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Inbox className="w-8 h-8 text-muted-foreground/40" /></div>
                <p className="text-[15px] font-semibold text-foreground">No users found</p>
                <p className="text-[13px] text-muted-foreground mt-1">{users.length === 0 ? "No users have registered yet." : "No users match your filters."}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">User</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Phone</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Roles</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Joined</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(user => (
                    <TableRow key={user.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => openUserDetail(user)}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                            {(user.full_name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-[13px] text-foreground block">{user.full_name || "Unnamed"}</span>
                            <span className="text-[11px] text-muted-foreground">{user.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{user.phone || "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.map(r => (
                            <span key={r} className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${roleColor(r)}`}>{r}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openUserDetail(user); }}><Eye className="w-4 h-4 mr-2" /> View Full Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setManagingUser(user); setEditForm({ full_name: user.full_name || "", phone: user.phone || "" }); setEditDialogOpen(true); }}><Pencil className="w-4 h-4 mr-2" /> Edit Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setManagingUser(user); setSelectedRole("user"); setRoleDialogOpen(true); }}><Shield className="w-4 h-4 mr-2" /> Manage Roles</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
                <p className="text-[12px] text-muted-foreground font-medium">Showing {filtered.length} of {users.length} users</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Edit User Profile</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Full Name</Label><Input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} /></div>
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleEditUser}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Assign Role</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-[13px] text-muted-foreground">Assign a role to <strong>{managingUser?.full_name || "this user"}</strong>.</p>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ASSIGNABLE_ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {managingUser && <p className="text-[12px] text-muted-foreground">Current roles: {managingUser.roles.join(", ")}</p>}
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={handleAssignRole}>Assign Role</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
