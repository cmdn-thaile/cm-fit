"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MascotCard } from "@/components/ui/MascotCard";

interface Achievement {
  id: string;
  type: string;
  title: string;
  earnedAt: string;
}

const ALL_ACHIEVEMENTS = [
  { type: "first_measurement", emoji: "🌟", title: "Lần đo đầu tiên", description: "Ghi nhận số đo đầu tiên" },
  { type: "streak_7", emoji: "🔥", title: "7 ngày liên tiếp", description: "Đo liên tục 7 ngày" },
  { type: "streak_30", emoji: "💪", title: "30 ngày liên tiếp", description: "Đo liên tục 30 ngày" },
  { type: "growth_spurt", emoji: "🌱", title: "Tăng trưởng vượt bậc", description: "Tăng chiều cao đáng kể" },
  { type: "consistent", emoji: "⭐", title: "Kiên trì", description: "Duy trì thói quen đo đều đặn" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

export default function AchievementsPage() {
  const [earned, setEarned] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((data) => setEarned(data.achievements || data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-bounce">🏆</div>
      </div>
    );
  }

  const earnedTypes = new Set(earned.map((a) => a.type));

  return (
    <motion.div
      className="px-4 py-6 pb-24 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-xl font-heading font-bold">🏅 Thành tựu của bạn</h2>

      {earned.length === 0 && (
        <MascotCard
          emoji="🌈"
          message="Bạn chưa có thành tựu nào. Hãy bắt đầu ghi nhận số đo để mở khóa thành tựu nhé!"
          variant="encourage"
        />
      )}

      <motion.div
        className="grid grid-cols-2 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {ALL_ACHIEVEMENTS.map((badge) => {
          const isEarned = earnedTypes.has(badge.type);
          const earnedData = earned.find((a) => a.type === badge.type);

          return (
            <motion.div
              key={badge.type}
              variants={item}
              className={`card text-center relative overflow-hidden ${
                isEarned
                  ? "border-accent bg-accent-light/20"
                  : "border-border bg-muted/30 opacity-60"
              }`}
            >
              {/* Badge emoji */}
              <div className={`text-4xl mb-2 ${!isEarned ? "grayscale" : ""}`}>
                {isEarned ? badge.emoji : <Lock size={28} className="mx-auto text-muted-foreground" />}
              </div>

              {/* Title */}
              <p className="font-heading font-bold text-sm">{badge.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>

              {/* Earned date */}
              {isEarned && earnedData && (
                <p className="text-[10px] text-accent-foreground mt-2 font-medium">
                  ✅ {format(new Date(earnedData.earnedAt), "dd/MM/yyyy", { locale: vi })}
                </p>
              )}

              {/* Locked overlay */}
              {!isEarned && (
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]" />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
