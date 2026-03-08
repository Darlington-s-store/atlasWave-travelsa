import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";

const Signup = () => {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "Error", description: "Please agree to the Terms of Service.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await signup(form);
    setLoading(false);
    if (result.success) {
      toast({ title: "Account created!", description: "Please check your email to verify your account before signing in." });
      navigate("/login");
    } else {
      toast({ title: "Signup failed", description: result.error || "Something went wrong.", variant: "destructive" });
    }
  };

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="AtlasWave" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xl font-bold text-primary-foreground font-display">AtlasWave</span>
          </Link>
          <div className="max-w-md">
            <h2 className="font-display text-4xl font-bold text-primary-foreground leading-tight mb-4">
              Your journey to global opportunities starts here.
            </h2>
            <p className="text-primary-foreground/70 text-lg">
              Join over 10,000 professionals navigating their immigration paths with confidence.
            </p>
          </div>
          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} AtlasWave Travel & Tours. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <Link to="/" className="flex lg:hidden items-center gap-3 mb-10">
            <img src={logo} alt="AtlasWave" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-lg font-bold text-foreground font-display">AtlasWave</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Create your account</h1>
            <p className="text-muted-foreground mt-2">Join AtlasWave to start your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Enter your full name" required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@example.com" required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+233 xxx xxx xxx" required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Create a password" required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} placeholder="••••••••" required className="h-12" />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox id="terms" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug">
                I agree to the <Link to="#" className="text-primary hover:underline">Terms of Service</Link> and <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
