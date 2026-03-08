import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Moon, Sun, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SettingsPage = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single();
    if (data?.display_name) setDisplayName(data.display_name);
  };

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

  // Init theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

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
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
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
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
