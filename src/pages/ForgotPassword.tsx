import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { PRODUCTION_URL } from "@/lib/siteConfig";
import logo from "@/assets/logo.jpeg";

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const ForgotPassword = () => {
  const [step, setStep] = useState<"request" | "token">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${PRODUCTION_URL}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Reset email sent", description: "Check your email for a reset link or 6-digit code." });
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (!requirements.every((r) => r.test(password))) {
      toast({ title: "Password is too weak", description: "Meet all requirements.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error: vErr } = await supabase.auth.verifyOtp({ email, token: token.trim(), type: "recovery" });
    if (vErr) {
      setLoading(false);
      toast({ title: "Invalid token", description: vErr.message, variant: "destructive" });
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const { error: uErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (uErr) {
      toast({ title: "Could not set password", description: uErr.message, variant: "destructive" });
      return;
    }
    // Notify admins
    if (userData?.user) {
      await supabase.from("notifications").insert({
        audience: "admin",
        title: "User reset password",
        body: `${userData.user.email} reset their password via token.`,
        type: "info",
        link: "/admin/users",
        metadata: { user_id: userData.user.id },
      });
      await supabase.from("notifications").insert({
        audience: "user",
        user_id: userData.user.id,
        title: "Password updated",
        body: "Your password was changed successfully.",
        type: "success",
        link: "/dashboard",
      });
    }
    toast({ title: "Password updated!", description: "You can now sign in." });
    await supabase.auth.signOut();
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
          {step === "request" ? (
            <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-foreground">Forgot password?</h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Enter your email — we'll send you a reset link and a 6-digit code.
                </p>
              </div>

              {sent ? (
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-secondary" />
                  </div>
                  <p className="text-foreground font-medium mb-1">Check your email</p>
                  <p className="text-muted-foreground text-sm mb-6">
                    Sent to <strong>{email}</strong>. Click the link or use the 6-digit code below.
                  </p>
                  <Button className="w-full h-12 mb-2" onClick={() => setStep("token")}>I have a code</Button>
                  <Button variant="outline" className="w-full h-12" onClick={() => setSent(false)}>Try another email</Button>
                </div>
              ) : (
                <form onSubmit={handleRequest} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
                  </div>
                  <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Email"}
                  </Button>
                </form>
              )}
            </>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-foreground">Enter your code</h1>
                <p className="text-muted-foreground text-sm mt-2">Paste the 6-digit code from your email and choose a new password.</p>
              </div>
              <form onSubmit={handleVerifyToken} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>6-digit token</Label>
                  <Input value={token} onChange={(e) => setToken(e.target.value)} maxLength={6} required className="h-12 tracking-widest text-center text-lg" />
                </div>
                <div className="space-y-2">
                  <Label>New password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm password</Label>
                  <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="h-12" />
                </div>
                <div className="space-y-1.5 text-xs">
                  {requirements.map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <CheckCircle className={`w-3.5 h-3.5 ${r.test(password) ? "text-secondary" : "text-border"}`} />
                      <span className={r.test(password) ? "text-foreground" : "text-muted-foreground"}>{r.label}</span>
                    </div>
                  ))}
                </div>
                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading ? "Updating..." : "Reset Password"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("request")}>Back</Button>
              </form>
            </>
          )}

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
