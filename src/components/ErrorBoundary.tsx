import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

function reportError(error: Error, errorInfo: ErrorInfo) {
  const payload = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  console.error("ErrorBoundary caught:", payload);

  if (typeof window !== "undefined" && "sendBeacon" in navigator) {
    const endpoint = import.meta.env.VITE_ERROR_REPORTING_URL;
    if (endpoint) {
      navigator.sendBeacon(endpoint, JSON.stringify(payload));
    }
  }
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Something went wrong
          </h2>
          <p className="max-w-md font-body text-sm text-muted-foreground">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="gradient-gold border-0 text-primary-foreground"
          >
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
