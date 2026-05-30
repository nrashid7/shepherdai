import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Heart, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const suggestedPrompts = [
  { text: "I feel anxious about the future", icon: "😟" },
  { text: "I'm struggling with forgiveness", icon: "🙏" },
  { text: "I need guidance about a decision", icon: "🤔" },
  { text: "Why does God allow suffering?", icon: "💭" },
];

const features = [
  {
    icon: MessageCircle,
    title: "Scripture Guidance",
    description: "Share your struggles and receive Bible-grounded wisdom with verse explanations and cross-references.",
  },
  {
    icon: Heart,
    title: "Prayer Companion",
    description: "Daily emotional check-ins with personalized prayers crafted from relevant scripture passages.",
  },
  {
    icon: BookOpen,
    title: "Devotional Generator",
    description: "Create multi-day devotionals on any topic with verses, reflections, and prayers.",
  },
  {
    icon: Sparkles,
    title: "Spiritual Memory",
    description: "Your journey is remembered — past verses and themes resurface when you need them most.",
  },
];

const Index = () => {
  useEffect(() => { document.title = "Shepherd AI — Scripture for Every Season of Life"; }, []);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="mb-4 font-body text-sm font-medium uppercase tracking-widest text-primary">
              Your AI Bible Companion
            </p>
            <h1 className="mx-auto mb-6 max-w-3xl font-display text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
              Scripture for Every{" "}
              <span className="text-gradient-gold">Season of Life</span>
            </h1>
            <p className="mx-auto mb-10 max-w-xl font-body text-lg text-muted-foreground">
              Share what's on your heart. Receive Bible verses, explanations, and
              personalized prayers grounded in God's Word.
            </p>

            <Link to="/chat">
              <Button
                size="lg"
                className="gradient-gold border-0 px-8 py-6 text-base font-semibold text-primary-foreground shadow-soft transition-all hover:opacity-90 hover:shadow-lg"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start a Conversation
              </Button>
            </Link>
          </motion.div>

          {/* Suggested Prompts */}
          <motion.div
            className="mt-12 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {suggestedPrompts.map((prompt) => (
              <Link
                key={prompt.text}
                to={`/chat?prompt=${encodeURIComponent(prompt.text)}`}
                className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-5 py-2.5 font-body text-sm text-foreground shadow-card backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-soft"
              >
                <span>{prompt.icon}</span>
                <span>{prompt.text}</span>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              How Shepherd AI Guides You
            </h2>
            <p className="mx-auto max-w-lg font-body text-muted-foreground">
              More than a Bible app — a companion that walks with you through
              life's questions and challenges.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-soft"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture Quote */}
      <section className="border-y border-border bg-secondary/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.blockquote
            className="mx-auto max-w-2xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-4 font-display text-2xl italic leading-relaxed text-foreground md:text-3xl">
              "Your word is a lamp for my feet, a light on my path."
            </p>
            <cite className="font-body text-sm font-medium not-italic text-primary">
              — Psalm 119:105
            </cite>
          </motion.blockquote>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-body text-sm text-muted-foreground">
            Shepherd AI — Scripture-grounded guidance for every season of life.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 font-body text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary hover:underline">
              Privacy Policy
            </Link>
            <span aria-hidden="true">&middot;</span>
            <Link to="/terms" className="hover:text-primary hover:underline">
              Terms of Service
            </Link>
            <span aria-hidden="true">&middot;</span>
            <Link to="/disclaimer" className="hover:text-primary hover:underline">
              AI Disclaimer
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
