import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPage = () => {
  useEffect(() => {
    document.title = "Privacy Policy — Shepherd AI";
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
          Privacy Policy
        </h1>

        <div className="prose prose-sm max-w-none font-body text-foreground dark:prose-invert">
          <p className="text-muted-foreground">Last updated: August 2026</p>

          <h2 className="font-display">1. Information We Collect</h2>
          <p>
            When you create an account, we collect your email address and
            optional display name. As you use the app, we store:
          </p>
          <ul>
            <li>Chat conversations and extracted spiritual themes</li>
            <li>Saved verses, prayer journal entries, and devotionals</li>
            <li>Daily check-in emotions and engagement streaks</li>
            <li>
              A spiritual memory graph (themes and verse references you engage
              with frequently)
            </li>
          </ul>

          <h2 className="font-display">2. How We Use Your Data</h2>
          <p>Your data is used solely to:</p>
          <ul>
            <li>Provide personalized scripture guidance and prayers</li>
            <li>Maintain your spiritual dashboard and history</li>
            <li>
              Improve response relevance through your spiritual memory context
            </li>
          </ul>
          <p>
            We do not sell, share, or monetize your personal data. We do not use
            your data to train AI models.
          </p>

          <h2 className="font-display">3. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>
              <strong>Supabase</strong> — database hosting, authentication, and
              serverless functions
            </li>
            <li>
              <strong>OpenRouter</strong> — AI model gateway for generating
              responses. Your messages are transmitted to OpenRouter and a
              model provider for processing. OpenRouter does not store prompt
              or response content by default; model-provider retention and
              training practices can vary by provider.
            </li>
          </ul>

          <h2 className="font-display">4. Data Security</h2>
          <p>
            All data is transmitted over HTTPS. User data is protected by
            row-level security policies ensuring you can only access your own
            data. Authentication is handled by Supabase Auth with secure session
            management.
          </p>

          <h2 className="font-display">5. Data Retention &amp; Deletion</h2>
          <p>
            Your data is retained as long as your account is active. You may
            delete your account and all associated data at any time from the
            Settings page. Upon deletion, all personal data is permanently
            removed from our systems.
          </p>

          <h2 className="font-display">6. Cookies &amp; Local Storage</h2>
          <p>
            We use <code>localStorage</code> to persist your theme preference
            (dark/light mode) and authentication session. We do not use tracking
            cookies or third-party analytics cookies.
          </p>

          <h2 className="font-display">7. Children&apos;s Privacy</h2>
          <p>
            Shepherd AI is not directed at children under 13. We do not
            knowingly collect personal information from children under 13.
          </p>

          <h2 className="font-display">8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data (available on the Dashboard)</li>
            <li>Delete your account and all associated data</li>
            <li>Export your data by contacting us</li>
          </ul>

          <h2 className="font-display">9. Contact</h2>
          <p>
            For privacy questions or data requests, email{" "}
            <a href="mailto:nr.rashid7@gmail.com">nr.rashid7@gmail.com</a> or
            visit our <Link to="/support">support page</Link>.
          </p>

          <h2 className="font-display">10. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Continued use of
            Shepherd AI after changes constitutes acceptance of the updated
            policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
