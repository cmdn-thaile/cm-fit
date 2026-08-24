"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, Scale, Ruler, Activity, Hash } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MascotCard } from "@/components/ui/MascotCard";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface UserProfile {
  id: string;
  displayName: string;
  avatarEmoji: string;
  avatarUrl?: string | null;
  email: string;
  dateOfBirth?: string;
  age?: { years: number; months: number } | null;
  latestMeasurement?: {
    id: string;
    height: number;
    weight: number;
    bmi: number | null;
    date: string;
  } | null;
  _count?: { measurements: number; achievements: number };
}

interface Measurement {
  id: string;
  weight: number;
  height: number;
  bmi: number;
  note?: string;
  date: string;
  createdAt: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/me").then((r) => r.json()),
      fetch("/api/measurements?limit=10").then((r) => r.json()),
    ])
      .then(([userData, measurementData]) => {
        setUser(userData);
        setMeasurements(measurementData.measurements || measurementData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-bounce">🐻</div>
      </div>
    );
  }

  const hasMeasurements = measurements.length > 0;
  const latest = hasMeasurements ? measurements[0] : null;
  const chartData = [...measurements]
    .reverse()
    .map((m) => ({
      date: format(new Date(m.date), "dd/MM", { locale: vi }),
      weight: m.weight,
      height: m.height,
      bmi: m.bmi,
    }));

  if (!hasMeasurements) {
    return (
      <motion.div
        className="px-4 py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-heading font-bold">
          Xin chào, {user?.displayName || "bạn"}! 👋
        </h2>
        <MascotCard
          emoji="🌟"
          message="Chào bạn! Hãy bắt đầu ghi nhận số đo đầu tiên để theo dõi sức khỏe nhé!"
          variant="encourage"
        />
        <Link href="/measure" className="btn-primary block text-center">
          + Ghi nhận số đo đầu tiên
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="px-4 py-6 pb-24 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Welcome */}
      <motion.div variants={item} className="flex items-center gap-3">
        <UserAvatar
          avatarUrl={user?.avatarUrl}
          hood={user?.avatarEmoji || "bear"}
          displayName={user?.displayName || ""}
          size="lg"
        />
        <div>
          <h2 className="text-xl font-heading font-bold">
            Xin chào, {user?.displayName}! 👋
          </h2>
          <p className="text-sm text-muted-foreground">
            Tiếp tục theo dõi sức khỏe nào!
          </p>
        </div>
      </motion.div>

      {/* Quick Stats — using latestMeasurement from API */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-light/40">
            <Scale size={18} className="text-primary-dark" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cân nặng</p>
            <p className="font-bold text-foreground">{latest!.weight} kg</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary/30">
            <Ruler size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Chiều cao</p>
            <p className="font-bold text-foreground">{latest!.height} cm</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent-light/40">
            <Activity size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">BMI</p>
            <p className="font-bold text-foreground">{latest!.bmi.toFixed(1)}</p>
          </div>
        </div>
        {user?.age ? (
          <div className="card flex items-center gap-3">
            <div className="p-2 rounded-xl bg-warning/30">
              <span className="text-lg">🎂</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tuổi</p>
              <p className="font-bold text-foreground">
                {user.age.years}t {user.age.months}th
              </p>
            </div>
          </div>
        ) : (
          <div className="card flex items-center gap-3">
            <div className="p-2 rounded-xl bg-warning/30">
              <Hash size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng số đo</p>
              <p className="font-bold text-foreground">{measurements.length}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Target Weight Card */}
      {latest && (() => {
        const heightM = latest.height / 100;
        // Adult healthy BMI range: 18.5 - 24.9, ideal midpoint = 22
        const idealBmi = 22;
        const targetWeight = Math.round(idealBmi * heightM * heightM * 10) / 10;
        const diff = Math.round((latest.weight - targetWeight) * 10) / 10;
        const isOnTarget = Math.abs(diff) <= 2;
        const isOver = diff > 2;

        return (
          <motion.div variants={item} className="card border-primary/30 bg-primary-light/10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">Cân nặng lý tưởng</p>
                <p className="text-2xl font-heading font-bold text-foreground">
                  {targetWeight} kg
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dựa trên chiều cao {latest.height} cm (BMI {idealBmi})
                </p>
              </div>
              <div className="text-right">
                {isOnTarget ? (
                  <div className="bg-accent/30 rounded-xl px-3 py-1.5">
                    <p className="text-xs font-bold text-green-700">✓ Đạt!</p>
                  </div>
                ) : isOver ? (
                  <div className="bg-warning/30 rounded-xl px-3 py-1.5">
                    <p className="text-xs font-bold text-orange-700">+{diff} kg</p>
                  </div>
                ) : (
                  <div className="bg-secondary/30 rounded-xl px-3 py-1.5">
                    <p className="text-xs font-bold text-blue-700">{diff} kg</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Weight Chart */}
      <motion.div variants={item} className="card">
        <h3 className="font-heading font-bold text-sm mb-3">📊 Cân nặng (kg)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a08878" />
            <YAxis tick={{ fontSize: 11 }} stroke="#a08878" domain={["auto", "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#F7A8B8"
              strokeWidth={3}
              dot={{ fill: "#F7A8B8", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Height Chart */}
      <motion.div variants={item} className="card">
        <h3 className="font-heading font-bold text-sm mb-3">📏 Chiều cao (cm)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a08878" />
            <YAxis tick={{ fontSize: 11 }} stroke="#a08878" domain={["auto", "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="height"
              stroke="#B8D4E3"
              strokeWidth={3}
              dot={{ fill: "#B8D4E3", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* BMI Chart */}
      <motion.div variants={item} className="card">
        <h3 className="font-heading font-bold text-sm mb-3">💪 BMI</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="bmiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C5E8D0" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#C5E8D0" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a08878" />
            <YAxis tick={{ fontSize: 11 }} stroke="#a08878" domain={["auto", "auto"]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="bmi"
              stroke="#C5E8D0"
              strokeWidth={3}
              fill="url(#bmiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Measurements */}
      <motion.div variants={item}>
        <h3 className="font-heading font-bold text-sm mb-3">📝 Ghi nhận gần đây</h3>
        <div className="space-y-3">
          {measurements.slice(0, 5).map((m) => (
            <div key={m.id} className="card flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {format(new Date(m.date), "dd/MM/yyyy", { locale: vi })}
                </p>
                {m.note && (
                  <p className="text-xs text-muted-foreground mt-0.5">{m.note}</p>
                )}
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-primary-dark font-semibold">{m.weight} kg</span>
                <span className="text-blue-600 font-semibold">{m.height} cm</span>
                <span className="text-green-600 font-semibold">BMI {m.bmi.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add new button */}
      <motion.div variants={item}>
        <Link
          href="/measure"
          className="btn-primary flex items-center justify-center gap-2 w-full"
        >
          <Plus size={18} />
          Ghi nhận mới
        </Link>
      </motion.div>
    </motion.div>
  );
}
