import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";
import adminLoginBg from "@/assets/admin-login-bg.mp4";

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
    <div className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">
      <div className="absolute inset-0">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={adminLoginBg} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,15,32,0.82)_0%,rgba(5,15,32,0.7)_38%,rgba(8,21,43,0.58)_62%,rgba(233,242,247,0.82)_100%)] lg:bg-[linear-gradient(90deg,rgba(5,15,32,0.82)_0%,rgba(5,15,32,0.72)_36%,rgba(7,20,41,0.58)_58%,rgba(244,249,252,0.74)_100%)]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px] translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] -translate-x-1/4 translate-y-1/4" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative overflow-hidden flex-col justify-between p-10 xl:p-14">

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-white/20 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="AtlasWave Travel and Tours" className="w-full h-full object-cover" />
            </div>
            <span className="text-primary-foreground font-display text-xl font-bold tracking-tight">
              AtlasWave Travel & Tours
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-primary-foreground font-display text-3xl xl:text-4xl font-bold leading-tight">
            Administration
            <br />
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
          © 2026 AtlasWave Travel & Tours
        </p>
      </div>

      <div className="lg:hidden relative px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
            <img src={logo} alt="AtlasWave Travel and Tours" className="w-full h-full object-cover" />
          </div>
          <span className="text-primary-foreground font-display text-lg font-bold">AtlasWave Travel and Tours</span>
        </div>
        <p className="text-primary-foreground/50 text-xs">Administration Portal</p>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-5 py-10 sm:px-8 lg:px-16">
        <div className="w-full max-w-[430px] rounded-[28px] border border-amber-300/40 bg-[rgba(9,18,34,0.78)] shadow-[0_24px_70px_rgba(15,23,42,0.32)] backdrop-blur-md p-7 sm:p-9">
          <div className="mb-8 lg:mb-10">
            <h2 className="font-display text-2xl sm:text-[28px] font-bold text-amber-300 tracking-tight">
              Welcome back
            </h2>
            <p className="text-amber-100/85 text-sm mt-1.5">
              Sign in to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-white uppercase tracking-wider">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@atlaswave.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-10 text-sm rounded-xl border-amber-200/70 bg-white text-slate-900 placeholder:text-slate-400 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-white uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-10 pr-11 text-sm rounded-xl border-amber-200/70 bg-white text-slate-900 placeholder:text-slate-400 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold rounded-xl mt-2 bg-amber-400 text-slate-950 hover:bg-amber-300"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 p-3.5 rounded-xl bg-white/10 border border-amber-300/25">
            <p className="text-[11px] text-white/75 text-center leading-relaxed">
              <span className="font-semibold text-amber-300">Note:</span>{" "}
              Only users with the admin role can sign in here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
