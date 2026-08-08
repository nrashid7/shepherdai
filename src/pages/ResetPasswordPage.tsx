import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getAuthRedirectUrl } from "@/lib/platform";
import { toast } from "sonner";

type Mode = "request" | "update";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isRecovery = searchParams.get("type") === "recovery";
  const [mode, setMode] = useState<Mode>(isRecovery ? "update" : "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Reset Password — Shepherd AI";
  }, []);

  useEffect(() => {
    if (isRecovery) setMode("update");
  }, [isRecovery]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getAuthRedirectUrl()}/reset-password?type=recovery`,
      });
      if (error) throw error;
      toast.success("Check your email for a password reset link.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      navigate("/chat");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center pt-16 px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold shadow-soft">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {mode === "request" ? "Reset Password" : "Set New Password"}
          </h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {mode === "request"
              ? "Enter your email to receive a reset link"
              : "Choose a new password for your account"}
          </p>
        </div>

        {mode === "request" ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold border-0 text-primary-foreground shadow-soft hover:opacity-90"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 bg-card border-border"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-gold border-0 text-primary-foreground shadow-soft hover:opacity-90"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center font-body text-sm text-muted-foreground">
          {mode === "request" ? (
            <>
              Remember your password?{" "}
              <button
                onClick={() => navigate("/auth")}
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Need a new link?{" "}
              <button
                onClick={() => setMode("request")}
                className="font-medium text-primary hover:underline"
              >
                Request again
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
