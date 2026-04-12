import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Shield, Users, UserMinus, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ASSIGNABLE_ROLES = ["admin", "moderator", "user"] as const;

const roleColor = (r: string) => {
  if (r === "admin") return "bg-destructive/15 text-destructive";
  if (r === "moderator") return "bg-primary/10 text-primary";
  return "bg-secondary/15 text-secondary";
};

interface UserWithRoles {
  id: string;
  full_name: string | null;
  phone: string | null;
  roles: string[];
}

const AdminRoles = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [selectedRole, setSelectedRole] = useState("user");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone");
    const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
    const roleMap: Record<string, string[]> = {};
    (allRoles || []).forEach(r => { if (!roleMap[r.user_id]) roleMap[r.user_id] = []; roleMap[r.user_id].push(r.role); });
    setUsers((profiles || []).map(p => ({ id: p.id, full_name: p.full_name, phone: p.phone, roles: roleMap[p.id] || ["user"] })));
    setLoading(false);
  };

  const handleAssignRole = async () => {
    if (!selectedUser) return;
    const { data: existing } = await supabase.from("user_roles").select("id").eq("user_id", selectedUser.id).eq("role", selectedRole as any);
    if (existing && existing.length > 0) { toast({ title: "Role already assigned" }); setRoleDialogOpen(false); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: selectedUser.id, role: selectedRole as any });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Role assigned" }); setRoleDialogOpen(false); fetchData();
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Role removed" }); fetchData();
  };

  const admins = users.filter(u => u.roles.includes("admin"));
  const moderators = users.filter(u => u.roles.includes("moderator"));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">Roles & Permissions</h2>
          <p className="text-[13px] text-muted-foreground mt-0.5">Create, edit, and assign roles with granular permission controls.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users.length, icon: Users, bg: "bg-primary/10", color: "text-primary" },
            { label: "Admins", value: admins.length, icon: Shield, bg: "bg-destructive/10", color: "text-destructive" },
            { label: "Moderators", value: moderators.length, icon: Shield, bg: "bg-primary/10", color: "text-primary" },
            { label: "Regular", value: users.length - admins.length - moderators.length, icon: Users, bg: "bg-secondary/15", color: "text-secondary" },
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

        <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16"><p className="text-muted-foreground text-[13px]">Loading...</p></div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Inbox className="w-8 h-8 text-muted-foreground/40" /></div>
                <p className="text-[15px] font-semibold text-foreground">No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">User</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold">Current Roles</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider font-bold text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div>
                          <span className="font-semibold text-[13px]">{u.full_name || "Unnamed"}</span>
                          <br /><span className="text-[11px] text-muted-foreground">{u.id.slice(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {u.roles.map(r => (
                            <div key={r} className="flex items-center gap-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${roleColor(r)}`}>{r}</span>
                              {r !== "user" && (
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleRemoveRole(u.id, r)}>
                                  <UserMinus className="w-3 h-3 text-destructive" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => { setSelectedUser(u); setSelectedRole("user"); setRoleDialogOpen(true); }}>
                          <Shield className="w-3 h-3 mr-1" /> Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Assign Role</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-[13px] text-muted-foreground">Assign a role to <strong>{selectedUser?.full_name || "this user"}</strong>.</p>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ASSIGNABLE_ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {selectedUser && <p className="text-[12px] text-muted-foreground">Current: {selectedUser.roles.join(", ")}</p>}
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

export default AdminRoles;
