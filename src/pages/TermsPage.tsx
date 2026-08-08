import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsPage = () => {
  useEffect(() => {
    document.title = "Terms of Service — Shepherd AI";
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
          Terms of Service
        </h1>

        <div className="prose prose-sm max-w-none font-body text-foreground dark:prose-invert">
          <p className="text-muted-foreground">Last updated: August 2026</p>

          <h2 className="font-display">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Shepherd AI, you agree to be bound by these
            Terms of Service. If you do not agree, please do not use the
            application.
          </p>

          <h2 className="font-display">2. Description of Service</h2>
          <p>
            Shepherd AI is an AI-powered Bible companion that provides
            scripture-grounded guidance, personalized prayers, multi-day
            devotionals, and Bible exploration tools. The service uses
            artificial intelligence to generate responses based on Biblical
            scripture.
          </p>

          <h2 className="font-display">3. AI-Generated Content Disclaimer</h2>
          <p>
            <strong>
              Shepherd AI is not a substitute for pastoral counsel, professional
              therapy, medical advice, or emergency services.
            </strong>
          </p>
          <ul>
            <li>
              AI-generated responses are for spiritual encouragement and
              educational purposes only
            </li>
            <li>
              While we ground responses in scripture from our database, AI may
              occasionally produce inaccurate or incomplete interpretations
            </li>
            <li>
              For serious spiritual questions, consult a pastor or qualified
              spiritual advisor
            </li>
            <li>
              For mental health concerns, contact a licensed professional or
              crisis service
            </li>
            <li>
              <strong>
                If you are in crisis, call 988 (Suicide &amp; Crisis Lifeline)
                or text HOME to 741741
              </strong>
            </li>
          </ul>

          <h2 className="font-display">4. User Accounts</h2>
          <p>
            You must be at least 13 years old to create an account. If you are
            under the age of legal majority where you live, you may use the
            service only with permission from a parent or legal guardian. You
            are responsible for maintaining the confidentiality of your
            account credentials. You must provide accurate information when
            creating an account. You may delete your account at any time from
            the Settings page.
          </p>

          <h2 className="font-display">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>
              Use the service for any unlawful purpose or in violation of any
              applicable laws
            </li>
            <li>
              Attempt to circumvent rate limits, abuse the API, or disrupt the
              service
            </li>
            <li>
              Use automated tools to scrape or extract data from the service
            </li>
            <li>
              Impersonate others or misrepresent your affiliation with any
              person or entity
            </li>
          </ul>

          <h2 className="font-display">6. Intellectual Property</h2>
          <p>
            Bible text used in this application is from the King James Version
            (KJV), which is in the public domain. AI-generated content
            (prayers, devotionals, explanations) is provided for your personal
            use. The Shepherd AI brand, design, and original software are
            proprietary.
          </p>

          <h2 className="font-display">7. Limitation of Liability</h2>
          <p>
            Shepherd AI is provided &quot;as is&quot; without warranties of any
            kind. We are not liable for any damages arising from your use of
            the service, reliance on AI-generated content, or inability to
            access the service.
          </p>

          <h2 className="font-display">8. Service Availability</h2>
          <p>
            We strive to keep Shepherd AI available but do not guarantee
            uninterrupted access. We may modify, suspend, or discontinue the
            service at any time without notice.
          </p>

          <h2 className="font-display">9. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of
            Shepherd AI after changes constitutes acceptance of the updated
            terms.
          </p>

          <h2 className="font-display">10. Contact</h2>
          <p>
            For questions about these terms, email{" "}
            <a href="mailto:nr.rashid7@gmail.com">nr.rashid7@gmail.com</a> or
            visit our <Link to="/support">support page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
