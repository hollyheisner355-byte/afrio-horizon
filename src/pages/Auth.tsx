import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent! Check your email.");
      setShowForgot(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary relative items-center justify-center p-12">
        <div className="relative z-10 text-center">
          <h2 className="font-display text-5xl font-bold text-secondary-foreground mb-4">
            Safari<span className="text-primary">Horizons</span>
          </h2>
          <p className="text-secondary-foreground/70 text-lg max-w-md mx-auto">
            Your gateway to Africa's most extraordinary wildlife experiences
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
            <ArrowLeft size={16} /> Back to home
          </Link>

          {showForgot ? (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Reset Password</h1>
              <p className="text-muted-foreground mb-8">Enter your email and we'll send you a reset link</p>
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1.5" />
                </div>
                <Button type="submit" className="w-full rounded-full py-5" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                <button onClick={() => setShowForgot(false)} className="text-primary font-medium hover:underline">Back to sign in</button>
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {isLogin ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-muted-foreground mb-8">
                {isLogin ? "Sign in to access your dashboard" : "Join us to start your African adventure"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required={!isLogin} className="mt-1.5" />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1.5">
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {isLogin && (
                    <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-primary hover:underline mt-2 block">
                      Forgot password?
                    </button>
                  )}
                </div>
                <Button type="submit" className="w-full rounded-full py-5" disabled={loading}>
                  {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
