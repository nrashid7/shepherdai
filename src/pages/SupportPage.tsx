import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

const SUPPORT_EMAIL = "nr.rashid7@gmail.com";

const SupportPage = () => {
  useEffect(() => {
    document.title = "Support — Shepherd AI";
  }, []);

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 font-body text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">
          Shepherd AI Support
        </h1>
        <div className="prose prose-sm max-w-none font-body text-foreground dark:prose-invert">
          <p>
            For help with your account, the app, privacy requests, or technical
            issues, email us. Please do not include passwords, private prayer
            journal entries, or other sensitive information.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 font-semibold text-primary"
          >
            <Mail className="h-4 w-4" /> {SUPPORT_EMAIL}
          </a>

          <h2 className="font-display">Delete your account</h2>
          <p>
            In Shepherd AI, open <strong>Settings</strong>, select
            <strong> Delete My Account</strong>, and confirm. This permanently
            removes your account and associated personal data. If you cannot
            access the app, contact support from your account email address.
          </p>

          <h2 className="font-display">Safety</h2>
          <p>
            Shepherd AI provides scripture-based encouragement and is not an
            emergency, medical, mental-health, or professional counseling
            service. If you are in immediate danger, call local emergency
            services. In the United States, call or text 988 for crisis support.
          </p>

          <h2 className="font-display">Legal and privacy</h2>
          <p>
            Review our <Link to="/privacy">Privacy Policy</Link>,{" "}
            <Link to="/terms">Terms of Service</Link>, and{" "}
            <Link to="/disclaimer">AI Disclaimer</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
