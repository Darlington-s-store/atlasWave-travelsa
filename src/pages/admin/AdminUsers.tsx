import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, UserPlus, MoreHorizontal, Eye, Pencil, Trash2, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

const ROLES = ["user", "moderator", "admin"];
const USER_STATUSES = ["active", "suspended", "pending"];

const statusColor = (s: string) => {
  if (s === "active") return "bg-secondary/15 text-secondary border-secondary/30";
  if (s === "suspended") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-accent/15 text-accent-foreground border-accent/30";
};

let nextUserId = 1;
const generateUserId = () => String(nextUserId++);

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [form, setForm] = useState({ name: "", email: "", role: "user", status: "active" });
  const resetForm = () => setForm({ name: "", email: "", role: "user", status: "active" });

  const openCreate = () => { resetForm(); setEditingUser(null); setDialogOpen(true); };
  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Validation Error", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...form } : u));
      toast({ title: "User Updated", description: `${form.name} has been updated.` });
    } else {
      const newUser: User = { id: generateUserId(), ...form, joined: new Date().toISOString().split("T")[0] };
      setUsers(prev => [newUser, ...prev]);
      toast({ title: "User Added", description: `${form.name} has been added.` });
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deletingUser) {
      setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
      toast({ title: "User Deleted", description: `${deletingUser.name} has been removed.` });
    }
    setDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-sans font-bold text-foreground tracking-tight">User Management</h2>
            <p className="text-muted-foreground text-[13px] mt-0.5">View, search, and manage all registered users.</p>
          </div>
          <Button className="w-fit gap-1.5" onClick={openCreate}>
            <UserPlus className="w-4 h-4" /> Add User
          </Button>
        </div>

        <Card className="shadow-card rounded-xl border border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">All ({users.length})</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">Active ({users.filter(u => u.status === "active").length})</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">Pending ({users.filter(u => u.status === "pending").length})</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card rounded-xl border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-[15px] font-semibold text-foreground">No users yet</p>
                <p className="text-[13px] text-muted-foreground mt-1 max-w-[300px]">
                  {users.length === 0 ? "Add your first user to get started." : "No users match your search."}
                </p>
                {users.length === 0 && (
                  <Button className="mt-4 gap-1.5" onClick={openCreate}>
                    <UserPlus className="w-4 h-4" /> Add User
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Name</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Email</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Role</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-bold">Status</TableHead>
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
                            {user.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-semibold text-[13px]">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{user.email}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize text-[11px]">{user.role}</Badge></TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px] text-muted-foreground">{user.joined}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setViewingUser(user); setViewDialogOpen(true); }}>
                              <Eye className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { setDeletingUser(user); setDeleteDialogOpen(true); }}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{USER_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>{editingUser ? "Save Changes" : "Add User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {viewingUser && (
            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Name</span><span className="font-semibold">{viewingUser.name}</span></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Email</span>{viewingUser.email}</div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Role</span><Badge variant="secondary" className="capitalize">{viewingUser.role}</Badge></div>
                <div><span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-0.5">Joined</span>{viewingUser.joined}</div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] uppercase tracking-wider font-bold mb-1">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusColor(viewingUser.status)}`}>{viewingUser.status}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            {viewingUser && <Button onClick={() => { setViewDialogOpen(false); openEdit(viewingUser); }}>Edit</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p className="text-[13px] text-muted-foreground py-2">
            Are you sure you want to delete <span className="font-bold text-foreground">{deletingUser?.name}</span>? This cannot be undone.
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

export default AdminUsers;
