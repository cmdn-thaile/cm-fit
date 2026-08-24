"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MascotCard } from "@/components/ui/MascotCard";
import { UserAvatar } from "@/components/ui/UserAvatar";

type Period = "weekly" | "monthly";

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  avatarUrl?: string | null;
  measurementCount: number;
  weightChange: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

function getMedalEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("weekly");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => setEntries(data.leaderboard || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-xl font-heading font-bold">
        🏆 Bảng xếp hạng giảm cân
      </h2>

      {/* Period tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod("weekly")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
            period === "weekly"
              ? "bg-primary text-white shadow-soft"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Tuần này
        </button>
        <button
          onClick={() => setPeriod("monthly")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
            period === "monthly"
              ? "bg-primary text-white shadow-soft"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Tháng này
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-4xl animate-bounce">🏆</div>
        </div>
      ) : entries.length === 0 ? (
        <MascotCard
          emoji="📊"
          message="Chưa có ai trên bảng xếp hạng. Cần ít nhất 2 lần đo trong kỳ để xếp hạng!"
          variant="default"
        />
      ) : (
        <>
          {/* Top 3 Podium */}
          {entries.length >= 3 && (
            <motion.div
              className="flex items-end justify-center gap-3 py-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* 2nd place */}
              <div className="flex flex-col items-center">
                <UserAvatar avatarUrl={entries[1].avatarUrl} hood={entries[1].avatarEmoji} displayName={entries[1].displayName} size="sm" />
                <div className="bg-secondary/40 rounded-t-xl w-20 h-20 flex flex-col items-center justify-center mt-1">
                  <span className="text-xl">🥈</span>
                  <p className="text-[10px] font-bold truncate w-16 text-center">
                    {entries[1].displayName}
                  </p>
                  <p className="text-[10px] font-bold text-green-600">
                    {entries[1].weightChange.toFixed(1)} kg
                  </p>
                </div>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center">
                <UserAvatar avatarUrl={entries[0].avatarUrl} hood={entries[0].avatarEmoji} displayName={entries[0].displayName} size="md" />
                <div className="bg-warning/40 rounded-t-xl w-24 h-28 flex flex-col items-center justify-center mt-1">
                  <span className="text-2xl">🥇</span>
                  <p className="text-xs font-bold truncate w-20 text-center">
                    {entries[0].displayName}
                  </p>
                  <p className="text-xs font-bold text-green-600">
                    {entries[0].weightChange.toFixed(1)} kg
                  </p>
                </div>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center">
                <UserAvatar avatarUrl={entries[2].avatarUrl} hood={entries[2].avatarEmoji} displayName={entries[2].displayName} size="sm" />
                <div className="bg-accent-light/40 rounded-t-xl w-20 h-16 flex flex-col items-center justify-center mt-1">
                  <span className="text-xl">🥉</span>
                  <p className="text-[10px] font-bold truncate w-16 text-center">
                    {entries[2].displayName}
                  </p>
                  <p className="text-[10px] font-bold text-green-600">
                    {entries[2].weightChange.toFixed(1)} kg
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Full ranking list */}
          <motion.div
            className="space-y-2"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {entries.map((entry, index) => {
              const rank = index + 1;
              const lost = entry.weightChange < 0;
              const gained = entry.weightChange > 0;

              return (
                <motion.div
                  key={entry.userId}
                  variants={item}
                  className={`card flex items-center gap-3 ${
                    rank <= 3 ? "border-warning/50" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center font-bold text-sm">
                    {rank <= 3 ? (
                      <span className="text-lg">{getMedalEmoji(rank)}</span>
                    ) : (
                      <span className="text-muted-foreground">{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <UserAvatar avatarUrl={entry.avatarUrl} hood={entry.avatarEmoji} displayName={entry.displayName} size="sm" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {entry.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.measurementCount} lần đo
                    </p>
                  </div>

                  {/* Weight change */}
                  <div
                    className={`rounded-xl px-3 py-1.5 ${
                      lost
                        ? "bg-green-100"
                        : gained
                        ? "bg-red-100"
                        : "bg-muted"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold ${
                        lost
                          ? "text-green-700"
                          : gained
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {lost ? "" : "+"}
                      {entry.weightChange.toFixed(1)} kg
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
