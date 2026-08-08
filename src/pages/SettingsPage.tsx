import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Moon, Sun, Save, Trash2, LifeBuoy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single();
    if (data?.display_name) setDisplayName(data.display_name);
  }, [user]);

  useEffect(() => {
    if (user) loadProfile();
  }, [user, loadProfile]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
    }
  };

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Deletion failed" }));
        throw new Error(body.error || "Deletion failed");
      }

      await signOut();
      toast.success("Your account and all data have been deleted.");
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete account";
      toast.error(message);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <p className="font-body text-muted-foreground">Sign in to manage your settings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto max-w-xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Settings</h1>

          {/* Profile */}
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Profile</h2>
            </div>
            <div className="mb-4">
              <label className="mb-1 block font-body text-sm text-muted-foreground">Email</label>
              <p className="font-body text-sm text-foreground">{user.email}</p>
            </div>
            <div className="mb-4">
              <label className="mb-1 block font-body text-sm text-muted-foreground">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="font-body"
              />
            </div>
            <Button onClick={saveProfile} disabled={saving} size="sm" className="gradient-gold border-0 text-primary-foreground">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>

          {/* Appearance */}
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Appearance</h2>
            <button
              onClick={toggleDark}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3 font-body text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <span className="flex items-center gap-2">
                {isDark ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
                {isDark ? "Dark Mode" : "Light Mode"}
              </span>
              <span className="text-xs text-muted-foreground">Click to toggle</span>
            </button>
          </div>

          {/* Support */}
          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="mb-3 flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">Support</h2>
            </div>
            <p className="font-body text-sm text-muted-foreground">
              Need help? Email{" "}
              <a className="text-primary hover:underline" href="mailto:nr.rashid7@gmail.com">
                nr.rashid7@gmail.com
              </a>{" "}
              or visit the <a className="text-primary hover:underline" href="/support">support page</a>.
            </p>
          </div>

          {/* Delete Account */}
          <div className="rounded-xl border border-destructive/30 bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <h2 className="font-display text-lg font-semibold text-foreground">Delete Account</h2>
            </div>
            <p className="mb-4 font-body text-sm text-muted-foreground">
              Permanently delete your account and all associated data including saved verses, prayers,
              conversations, and devotionals. This action cannot be undone.
            </p>
            {!confirmDelete ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Everything"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
