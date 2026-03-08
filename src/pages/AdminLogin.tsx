import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Lock, Mail } from "lucide-react";
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
    const result = await adminLogin(email, password);
    setLoading(false);
    if (result.success) {
      navigate("/admin");
    } else {
      toast({ title: "Access Denied", description: result.error || "Invalid admin credentials.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Branded Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-primary relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] -translate-x-1/4 translate-y-1/4" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-primary-foreground font-display text-xl font-bold tracking-tight">
              African Waves
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-primary-foreground font-display text-3xl xl:text-4xl font-bold leading-tight">
            Administration<br />
            <span className="text-accent">Control Center</span>
          </h1>
          <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-sm">
            Manage applications, users, payments, and content from a single unified dashboard.
          </p>
          <div className="flex gap-6 pt-2">
            {[
              { label: "Applications", value: "Manage" },
              { label: "Users", value: "Control" },
              { label: "Payments", value: "Track" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-accent font-bold text-sm">{item.value}</p>
                <p className="text-primary-foreground/40 text-xs mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-primary-foreground/30 text-xs">
          © 2024 African Waves Logistics & Immigration
        </p>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-primary px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-accent-foreground" />
          </div>
          <span className="text-primary-foreground font-display text-lg font-bold">African Waves</span>
        </div>
        <p className="text-primary-foreground/50 text-xs">Administration Portal</p>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 lg:px-16 bg-background">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:mb-10">
            <h2 className="font-display text-2xl sm:text-[28px] font-bold text-foreground tracking-tight">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Sign in to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@africanwaves.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-12 pl-10 text-sm rounded-xl border-input bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-12 pl-10 pr-11 text-sm rounded-xl border-input bg-muted/30 focus:bg-background transition-colors"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold rounded-xl mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 p-3.5 rounded-xl bg-muted/50 border border-border">
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              <span className="font-semibold text-foreground/70">Demo credentials:</span>{" "}
              admin@africanwaves.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
