import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, BookOpen } from "lucide-react";

const emotions = [
  { label: "Anxious", emoji: "😟", color: "bg-primary/10 border-primary/20 text-foreground" },
  { label: "Grateful", emoji: "🙏", color: "bg-primary/10 border-primary/20 text-foreground" },
  { label: "Sad", emoji: "😢", color: "bg-primary/10 border-primary/20 text-foreground" },
  { label: "Hopeful", emoji: "✨", color: "bg-primary/10 border-primary/20 text-foreground" },
  { label: "Angry", emoji: "😤", color: "bg-primary/10 border-primary/20 text-foreground" },
  { label: "Seeking Guidance", emoji: "🧭", color: "bg-primary/10 border-primary/20 text-foreground" },
];

const demoPrayers: Record<string, { verse: string; ref: string; prayer: string; reflection: string }> = {
  Anxious: {
    verse: "Cast all your anxiety on him because he cares for you.",
    ref: "1 Peter 5:7",
    prayer: "Lord, I lay my worries at Your feet. You know every anxious thought and every fear. Replace my anxiety with Your perfect peace. Help me trust that You are in control. Amen.",
    reflection: "What is one worry you can intentionally surrender to God today?",
  },
  Grateful: {
    verse: "Give thanks to the Lord, for he is good; his love endures forever.",
    ref: "Psalm 107:1",
    prayer: "Father, thank You for Your endless goodness. Open my eyes to the blessings around me, even in difficult seasons. Let gratitude fill my heart and overflow into my words and actions. Amen.",
    reflection: "Name three specific things you're grateful for right now.",
  },
  Sad: {
    verse: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
    ref: "Psalm 34:18",
    prayer: "God, You see my sorrow and You draw near. Comfort me in this pain and remind me that weeping may last for the night, but joy comes in the morning. Amen.",
    reflection: "How have you experienced God's comfort in past seasons of sadness?",
  },
  Hopeful: {
    verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    ref: "Jeremiah 29:11",
    prayer: "Lord, thank You for the hope that fills my heart. Strengthen this hope and help me share it with others who need encouragement. May my hope always be anchored in You. Amen.",
    reflection: "What new season of hope is God stirring in your life?",
  },
  Angry: {
    verse: "In your anger do not sin. Do not let the sun go down while you are still angry.",
    ref: "Ephesians 4:26",
    prayer: "Father, I bring my anger to You. Help me process this emotion in a way that honors You. Give me wisdom, patience, and a heart of forgiveness. Amen.",
    reflection: "Is there someone you need to extend grace to today?",
  },
  "Seeking Guidance": {
    verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    ref: "Proverbs 3:5-6",
    prayer: "God, I don't know which way to turn, but You do. Guide my steps and give me clarity. Help me trust Your timing and Your plan, even when the way forward is unclear. Amen.",
    reflection: "What decision are you waiting on God for clarity?",
  },
};

const PrayerPage = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const prayer = selectedEmotion ? demoPrayers[selectedEmotion] : null;

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold shadow-soft">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
            How are you feeling today?
          </h1>
          <p className="font-body text-muted-foreground">
            Select what resonates with your heart right now.
          </p>
        </motion.div>

        {/* Emotion Grid */}
        <motion.div
          className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {emotions.map((emotion) => {
            const isActive = selectedEmotion === emotion.label;
            return (
              <button
                key={emotion.label}
                onClick={() => setSelectedEmotion(emotion.label)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-5 font-body transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-soft"
                    : "border-border bg-card shadow-card hover:border-primary/30 hover:shadow-soft"
                }`}
              >
                <span className="text-3xl">{emotion.emoji}</span>
                <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                  {emotion.label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Prayer Response */}
        <AnimatePresence mode="wait">
          {prayer && (
            <motion.div
              key={selectedEmotion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Verse Card */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-display text-sm font-semibold text-primary">
                    {prayer.ref}
                  </span>
                </div>
                <p className="font-display text-lg italic leading-relaxed text-foreground">
                  "{prayer.verse}"
                </p>
              </div>

              {/* Prayer */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-3 font-display text-lg font-semibold text-foreground">
                  Your Prayer
                </h3>
                <p className="font-body italic leading-relaxed text-muted-foreground">
                  {prayer.prayer}
                </p>
              </div>

              {/* Reflection */}
              <div className="rounded-xl border border-border bg-secondary/50 p-6">
                <h3 className="mb-2 font-display text-base font-semibold text-foreground">
                  Reflection
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {prayer.reflection}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PrayerPage;
