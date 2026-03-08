import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { User, LogOut, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
  "in-review": { icon: AlertCircle, color: "bg-blue-100 text-blue-800", label: "In Review" },
  approved: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Approved" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Rejected" },
};

const Profile = () => {
  const { user, isAuthenticated, logout, updateProfile, applications } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName || "", phone: user?.phone || "" });

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
    toast({ title: "Profile updated!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container max-w-4xl mx-auto py-12">
          {/* Profile Card */}
          <div className="bg-card rounded-2xl border shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">{user?.fullName}</h1>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>

            {editing ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <Label>Full Name</Label>
                  <Input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {user?.phone}</p>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>
              </div>
            )}
          </div>

          {/* Applications */}
          <div className="bg-card rounded-2xl border shadow-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">My Applications</h2>
            </div>
            <div className="space-y-4">
              {applications.map((app) => {
                const cfg = statusConfig[app.status];
                const StatusIcon = cfg.icon;
                return (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-medium text-foreground">{app.title}</p>
                      <p className="text-sm text-muted-foreground">{app.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">{app.id} · {app.date}</p>
                    </div>
                    <Badge className={cfg.color}>
                      <StatusIcon className="w-3 h-3 mr-1" /> {cfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
