import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Phone } from "lucide-react";

const DisclaimerPage = () => {
  useEffect(() => {
    document.title = "AI Disclaimer — Shepherd AI";
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
          AI &amp; Medical Disclaimer
        </h1>

        <div className="prose prose-sm max-w-none font-body text-foreground dark:prose-invert">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  Shepherd AI is not a substitute for professional help.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This application uses artificial intelligence to provide
                  spiritual encouragement based on Biblical scripture. It does
                  not provide medical, psychological, psychiatric, or
                  professional counseling services.
                </p>
              </div>
            </div>
          </div>

          <h2 className="font-display">About AI-Generated Content</h2>
          <p>
            Shepherd AI uses large language models (LLMs) to generate prayers,
            devotionals, and scripture-based guidance. While we take steps to
            ground responses in authoritative Biblical text from our database:
          </p>
          <ul>
            <li>
              AI may occasionally misinterpret, misattribute, or incompletely
              represent scripture
            </li>
            <li>
              AI-generated theological interpretations reflect general
              Christian perspectives and may not align with every denomination
              or tradition
            </li>
            <li>
              Responses are generated dynamically and are not reviewed by
              trained theologians or pastors before delivery
            </li>
            <li>
              The AI does not have personal experience, emotions, or spiritual
              authority
            </li>
          </ul>

          <h2 className="font-display">
            Not a Replacement for Pastoral Care
          </h2>
          <p>
            For serious spiritual matters, doctrinal questions, or personal
            crises, we strongly encourage you to seek guidance from:
          </p>
          <ul>
            <li>Your local pastor or spiritual advisor</li>
            <li>A licensed Christian counselor</li>
            <li>Your church community</li>
          </ul>

          <h2 className="font-display">Mental Health &amp; Crisis</h2>
          <p>
            Shepherd AI includes crisis detection that displays helpline
            resources when concerning language is detected. However, this is
            not a clinical tool and should not be relied upon for mental health
            assessment or intervention.
          </p>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold">If you are in crisis:</p>
                <ul className="mt-2 list-none pl-0">
                  <li>
                    <strong>988 Suicide &amp; Crisis Lifeline:</strong> Call or
                    text <strong>988</strong>
                  </li>
                  <li>
                    <strong>Crisis Text Line:</strong> Text{" "}
                    <strong>HOME</strong> to <strong>741741</strong>
                  </li>
                  <li>
                    <strong>Emergency:</strong> Call <strong>911</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="font-display">Scripture Authority</h2>
          <p>
            Shepherd AI retrieves scripture text from a database of the King
            James Version (KJV) Bible. While the scripture text itself is
            authoritative, the AI-generated explanations, applications, and
            prayers that accompany the scripture are interpretive aids and
            should be evaluated against your own study and pastoral guidance.
          </p>

          <h2 className="font-display">Your Responsibility</h2>
          <p>
            By using Shepherd AI, you acknowledge that you understand the
            limitations of AI-generated spiritual content and that you will
            exercise your own judgment in applying any guidance received through
            this application to your life.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
