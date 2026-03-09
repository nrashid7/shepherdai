import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page Not Found — Shepherd AI";
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 pt-16">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-gold shadow-soft">
        <BookOpen className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="mb-2 font-display text-5xl font-bold text-foreground">404</h1>
      <p className="mb-6 font-body text-lg text-muted-foreground">This page doesn't exist.</p>
      <Link to="/">
        <Button className="gradient-gold border-0 text-primary-foreground shadow-soft hover:opacity-90">
          Return Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
