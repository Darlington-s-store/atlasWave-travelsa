import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await adminLogin(email, password);
    setLoading(false);
    if (success) {
      navigate("/admin");
    } else {
      toast({ title: "Access Denied", description: "Invalid admin credentials.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-card-hover border border-border/60 rounded-2xl relative z-10">
        <CardHeader className="text-center space-y-4 pb-2 pt-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-sans font-bold text-foreground tracking-tight">Admin Portal</CardTitle>
            <CardDescription className="text-[13px] mt-1.5">Sign in to access the administration dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-7 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-semibold text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@africanwaves.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11 text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px] font-semibold text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 text-[13px] pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-[14px] font-semibold rounded-xl" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground mt-4">
              Demo: admin@africanwaves.com / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
