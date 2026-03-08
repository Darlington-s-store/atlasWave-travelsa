import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, MoreHorizontal, UserPlus } from "lucide-react";

const mockUsers = [
  { id: "1", name: "Kwame Asante", email: "kwame@example.com", role: "user", status: "active", joined: "2025-12-01" },
  { id: "2", name: "Ama Mensah", email: "ama@example.com", role: "user", status: "active", joined: "2025-11-15" },
  { id: "3", name: "Kofi Boateng", email: "kofi@example.com", role: "user", status: "suspended", joined: "2026-01-05" },
  { id: "4", name: "Yaa Serwaa", email: "yaa@example.com", role: "moderator", status: "active", joined: "2025-10-20" },
  { id: "5", name: "Daniel Ofori", email: "daniel@example.com", role: "user", status: "pending", joined: "2026-03-01" },
];

const AdminUsers = () => {
  const [search, setSearch] = useState("");

  const filtered = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => {
    if (s === "active") return "bg-secondary/15 text-secondary border-secondary/30";
    if (s === "suspended") return "bg-destructive/15 text-destructive border-destructive/30";
    return "bg-accent/15 text-accent-foreground border-accent/30";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">User Management</h2>
            <p className="text-muted-foreground mt-1">View, search, and manage all registered users.</p>
          </div>
          <Button className="w-fit">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">All ({mockUsers.length})</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">Active ({mockUsers.filter(u => u.status === "active").length})</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">Pending ({mockUsers.filter(u => u.status === "pending").length})</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.joined}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No users found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
