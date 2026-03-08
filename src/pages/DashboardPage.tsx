import { motion } from "framer-motion";
import { BookOpen, Heart, Map, Bookmark } from "lucide-react";

const savedVerses = [
  { ref: "Isaiah 41:10", text: "So do not fear, for I am with you...", theme: "Fear", date: "Mar 5" },
  { ref: "Philippians 4:6-7", text: "Do not be anxious about anything...", theme: "Anxiety", date: "Mar 3" },
  { ref: "Romans 8:28", text: "And we know that in all things God works for the good...", theme: "Hope", date: "Feb 28" },
  { ref: "Psalm 23:4", text: "Even though I walk through the darkest valley...", theme: "Comfort", date: "Feb 25" },
];

const lifeVerseMap = [
  { theme: "Fear", verse: "Isaiah 41:10", count: 5 },
  { theme: "Hope", verse: "Romans 8:28", count: 4 },
  { theme: "Forgiveness", verse: "Matthew 18:21-22", count: 3 },
  { theme: "Anxiety", verse: "Philippians 4:6-7", count: 6 },
  { theme: "Guidance", verse: "Proverbs 3:5-6", count: 2 },
  { theme: "Comfort", verse: "Psalm 23", count: 4 },
];

const recentPrayers = [
  { date: "Mar 5", emotion: "Anxious", preview: "Lord, I lay my worries at Your feet..." },
  { date: "Mar 3", emotion: "Grateful", preview: "Father, thank You for Your endless goodness..." },
  { date: "Feb 28", emotion: "Seeking Guidance", preview: "God, I don't know which way to turn..." },
];

const DashboardPage = () => {
  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
            Your Spiritual Journey
          </h1>
          <p className="font-body text-muted-foreground">
            A reflection of your walk with scripture and prayer.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Life Verse Map */}
          <motion.div
            className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Life Verse Map
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {lifeVerseMap.map((item) => (
                <div
                  key={item.theme}
                  className="flex flex-col rounded-lg border border-border bg-secondary/50 px-4 py-3"
                  style={{ minWidth: "140px" }}
                >
                  <span className="font-body text-xs font-medium uppercase tracking-wider text-primary">
                    {item.theme}
                  </span>
                  <span className="mt-1 font-display text-sm font-semibold text-foreground">
                    {item.verse}
                  </span>
                  <span className="mt-1 font-body text-xs text-muted-foreground">
                    Referenced {item.count} times
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Prayer Journal */}
          <motion.div
            className="rounded-xl border border-border bg-card p-6 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recent Prayers
              </h2>
            </div>
            <div className="space-y-4">
              {recentPrayers.map((prayer, i) => (
                <div key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs font-medium text-primary">
                      {prayer.emotion}
                    </span>
                    <span className="font-body text-xs text-muted-foreground">
                      {prayer.date}
                    </span>
                  </div>
                  <p className="mt-1 font-body text-sm italic text-muted-foreground line-clamp-2">
                    {prayer.preview}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Saved Verses */}
          <motion.div
            className="lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-5 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Saved Verses
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {savedVerses.map((verse) => (
                <div
                  key={verse.ref}
                  className="rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:shadow-soft"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-body text-xs font-medium uppercase tracking-wider text-primary">
                      {verse.theme}
                    </span>
                    <span className="font-body text-xs text-muted-foreground">{verse.date}</span>
                  </div>
                  <p className="mb-1 font-display text-sm font-semibold text-foreground">
                    {verse.ref}
                  </p>
                  <p className="font-body text-xs leading-relaxed text-muted-foreground">
                    {verse.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
