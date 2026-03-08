import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, MessageCircle, Heart, LayoutDashboard, FileText, LogIn, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { path: "/", label: "Home", icon: BookOpen },
  { path: "/chat", label: "Chat", icon: MessageCircle },
  { path: "/prayer", label: "Prayer", icon: Heart },
  { path: "/devotional", label: "Devotional", icon: FileText },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <>
      {/* Top navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-gold">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              Shepherd AI
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="ml-2 border-l border-border pl-2 flex items-center gap-1">
              {user && (
                <Link
                  to="/settings"
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === "/settings"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              )}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile: only show auth button in top bar */}
          <div className="flex items-center gap-1 md:hidden">
            {user ? (
              <button onClick={handleSignOut} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <Link to="/auth" className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
                <LogIn className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          {user && (
            <Link
              to="/settings"
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-colors ${
                location.pathname === "/settings" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-[10px] font-medium">Settings</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
