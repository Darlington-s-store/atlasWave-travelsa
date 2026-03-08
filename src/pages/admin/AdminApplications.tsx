import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";

const mockApplications = [
  { id: "APP-001", applicant: "Kwame Asante", type: "Work Permit", country: "Germany", status: "pending", date: "2026-03-05" },
  { id: "APP-002", applicant: "Ama Mensah", type: "Visa", country: "France", status: "in-review", date: "2026-03-03" },
  { id: "APP-003", applicant: "Kofi Boateng", type: "LMIA", country: "Canada", status: "approved", date: "2026-02-28" },
  { id: "APP-004", applicant: "Yaa Serwaa", type: "Credential Eval", country: "USA", status: "rejected", date: "2026-02-25" },
  { id: "APP-005", applicant: "Daniel Ofori", type: "Chancenkarte", country: "Germany", status: "pending", date: "2026-03-07" },
];

const mockBookings = [
  { id: "BK-001", customer: "Ama Mensah", type: "Flight", destination: "Frankfurt", status: "confirmed", date: "2026-03-10" },
  { id: "BK-002", customer: "Kwame Asante", type: "Hotel", destination: "Paris", status: "pending", date: "2026-03-15" },
  { id: "BK-003", customer: "Kofi Boateng", type: "Flight", destination: "Toronto", status: "cancelled", date: "2026-02-20" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "bg-accent/15 text-accent-foreground border-accent/30",
    "in-review": "bg-primary/15 text-primary border-primary/30",
    approved: "bg-secondary/15 text-secondary border-secondary/30",
    confirmed: "bg-secondary/15 text-secondary border-secondary/30",
    rejected: "bg-destructive/15 text-destructive border-destructive/30",
    cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return map[status] || "";
};

const AdminApplications = () => {
  const [appSearch, setAppSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");

  const filteredApps = mockApplications.filter(a =>
    a.applicant.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.id.toLowerCase().includes(appSearch.toLowerCase())
  );

  const filteredBookings = mockBookings.filter(b =>
    b.customer.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.id.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Applications & Bookings</h2>
          <p className="text-muted-foreground mt-1">Review, approve, or reject applications and manage travel bookings.</p>
        </div>

        <Tabs defaultValue="applications">
          <TabsList>
            <TabsTrigger value="applications">Applications ({mockApplications.length})</TabsTrigger>
            <TabsTrigger value="bookings">Bookings ({mockBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card className="shadow-card mt-4">
              <CardHeader className="pb-3">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by ID or applicant..." value={appSearch} onChange={e => setAppSearch(e.target.value)} className="pl-9" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApps.map(app => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-xs">{app.id}</TableCell>
                        <TableCell className="font-medium">{app.applicant}</TableCell>
                        <TableCell>{app.type}</TableCell>
                        <TableCell>{app.country}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{app.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:text-secondary" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="shadow-card mt-4">
              <CardHeader className="pb-3">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search bookings..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} className="pl-9" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map(bk => (
                      <TableRow key={bk.id}>
                        <TableCell className="font-mono text-xs">{bk.id}</TableCell>
                        <TableCell className="font-medium">{bk.customer}</TableCell>
                        <TableCell>{bk.type}</TableCell>
                        <TableCell>{bk.destination}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge(bk.status)}`}>
                            {bk.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{bk.date}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminApplications;
