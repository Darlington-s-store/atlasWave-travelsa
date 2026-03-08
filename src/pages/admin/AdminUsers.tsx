import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Pencil, Inbox, Users, Shield, Trash2, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
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

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserRow | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const [managingUser, setManagingUser] = useState<UserRow | null>(null);
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
        avatar_url: p.avatar_url, created_at: p.created_at,
        roles: roleMap[p.id] || ["user"],
      })));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
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
  };

  const filtered = users.filter(u => {
    const matchesSearch = (u.full_name || "").toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

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
                    <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
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
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setViewingUser(user); setViewDialogOpen(true); }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setManagingUser(user); setEditForm({ full_name: user.full_name || "", phone: user.phone || "" }); setEditDialogOpen(true); }}><Pencil className="w-4 h-4 mr-2" /> Edit Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setManagingUser(user); setSelectedRole("user"); setRoleDialogOpen(true); }}><Shield className="w-4 h-4 mr-2" /> Assign Role</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.roles.filter(r => r !== "user").map(r => (
                              <DropdownMenuItem key={r} onClick={() => handleRemoveRole(user.id, r)} className="text-destructive">
                                <UserMinus className="w-4 h-4 mr-2" /> Remove {r} role
                              </DropdownMenuItem>
                            ))}
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {viewingUser && (
            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Name</span><span className="font-semibold">{viewingUser.full_name || "Unnamed"}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Phone</span>{viewingUser.phone || "—"}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">User ID</span><span className="font-mono text-[11px]">{viewingUser.id}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Joined</span>{new Date(viewingUser.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Roles</span>
                <div className="flex gap-1">{viewingUser.roles.map(r => <Badge key={r} variant="secondary" className="capitalize">{r}</Badge>)}</div>
              </div>
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Edit User Profile</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
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
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleAssignRole}>Assign Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
