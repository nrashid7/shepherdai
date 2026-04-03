import { Flame } from "lucide-react";
import { motion } from "framer-motion";

type CheckinPanelProps = {
  checkinStreak: number;
};

export function CheckinPanel({ checkinStreak }: CheckinPanelProps) {
  if (checkinStreak <= 0) return null;
  return (
    <motion.div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Flame className="h-6 w-6 text-primary" />
      <div>
        <p className="font-display text-lg font-bold text-foreground">{checkinStreak}-day streak!</p>
        <p className="font-body text-xs text-muted-foreground">Keep checking in daily to grow your streak.</p>
      </div>
    </motion.div>
  );
}
