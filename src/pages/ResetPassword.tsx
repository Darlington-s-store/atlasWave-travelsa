import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!requirements.every((r) => r.test(password))) {
      toast({ title: "Error", description: "Please meet all password requirements.", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast({ title: "Password updated!", description: "You can now sign in with your new password." });
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="AtlasWave" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xl font-bold text-foreground font-display">AtlasWave</span>
          </Link>
        </div>

        <div className="bg-card rounded-2xl border shadow-lg p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">Reset Password</h1>
            <p className="text-muted-foreground text-sm mt-2">Enter a new password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required className="h-12" />
            </div>

            {/* Password requirements */}
            <div className="space-y-2 py-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password Requirements</p>
              {requirements.map((req) => {
                const met = req.test(password);
                return (
                  <div key={req.label} className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 transition-colors ${met ? "text-secondary" : "text-border"}`} />
                    <span className={`text-sm transition-colors ${met ? "text-foreground" : "text-muted-foreground"}`}>{req.label}</span>
                  </div>
                );
              })}
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>

          <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground mt-6 transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
