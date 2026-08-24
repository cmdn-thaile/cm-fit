"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Scale, Ruler, Calendar, FileText, Activity } from "lucide-react";
import { createMeasurementSchema } from "@/lib/validators";
import { MascotCard } from "@/components/ui/MascotCard";
import { z } from "zod";

type MeasurementForm = z.infer<typeof createMeasurementSchema>;

interface LatestMeasurement {
  id: string;
  height: number;
  weight: number;
  bmi: number | null;
  date: string;
}

export default function MeasurePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [achievement, setAchievement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [latestMeasurement, setLatestMeasurement] =
    useState<LatestMeasurement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MeasurementForm>({
    resolver: zodResolver(createMeasurementSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      weight: undefined,
      height: undefined,
      note: "",
    },
  });

  // Fetch latest measurement to autofill height
  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch("/api/measurements/latest");
        if (res.ok) {
          const data = await res.json();
          if (data.measurement) {
            setLatestMeasurement(data.measurement);
            // Autofill height from latest measurement
            setValue("height", data.measurement.height);
          }
        }
      } catch {
        // No previous measurement — first time user
      } finally {
        setLoading(false);
      }
    }
    fetchLatest();
  }, [setValue]);

  const weight = watch("weight");
  const height = watch("height");

  // Live BMI calculation using current form values
  const liveBmi =
    weight && height && height > 0
      ? (weight / ((height / 100) * (height / 100))).toFixed(1)
      : null;

  const onSubmit = async (data: MeasurementForm) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Lỗi khi ghi nhận");

      const result = await res.json();

      // Show achievement if returned
      if (result.newAchievements && result.newAchievements.length > 0) {
        setAchievement(result.newAchievements[0].title);
        setTimeout(() => router.push("/"), 2000);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-4">
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-16 w-full rounded-2xl" />
        <div className="skeleton h-16 w-full rounded-2xl" />
      </div>
    );
  }

  const isFirstMeasurement = !latestMeasurement;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header Mascot */}
      <MascotCard
        emoji={isFirstMeasurement ? "🐰" : "📏"}
        message={
          isFirstMeasurement
            ? "Lần đo đầu tiên! Hãy nhập chiều cao và cân nặng của bạn nhé 🌟"
            : "Hãy ghi nhận số đo hôm nay nhé! Mỗi lần đo là một bước tiến 🎉"
        }
        variant={isFirstMeasurement ? "default" : "encourage"}
      />

      {/* Achievement toast */}
      {achievement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-accent/20 border-accent text-center"
        >
          <p className="text-lg font-bold">🎉 Thành tựu mới!</p>
          <p className="text-sm text-foreground/80">{achievement}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Height — autofilled from latest, but editable */}
        <div>
          <label className="label flex items-center gap-2">
            <Ruler size={14} />
            Chiều cao
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              placeholder={isFirstMeasurement ? "Ví dụ: 135.0" : undefined}
              className="input pr-10"
              {...register("height", { valueAsNumber: true })}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              cm
            </span>
          </div>
          {!isFirstMeasurement && (
            <p className="text-xs text-muted-foreground mt-1">
              ← Tự động lấy từ lần đo gần nhất. Bạn có thể sửa nếu đã cao hơn!
            </p>
          )}
          {errors.height && (
            <p className="text-xs text-red-500 mt-1">{errors.height.message}</p>
          )}
        </div>

        {/* Weight — always empty for new entry */}
        <div>
          <label className="label flex items-center gap-2">
            <Scale size={14} />
            Cân nặng
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              placeholder="Nhập cân nặng"
              className="input pr-10"
              {...register("weight", { valueAsNumber: true })}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              kg
            </span>
          </div>
          {errors.weight && (
            <p className="text-xs text-red-500 mt-1">{errors.weight.message}</p>
          )}
        </div>

        {/* Live BMI Preview */}
        {liveBmi && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="card bg-accent/20 border-accent flex items-center gap-3"
          >
            <Activity size={20} className="text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">BMI dự kiến</p>
              <p className="font-bold text-lg text-green-700">{liveBmi}</p>
            </div>
          </motion.div>
        )}

        {/* Date */}
        <div>
          <label className="label flex items-center gap-2">
            <Calendar size={14} />
            Ngày đo
          </label>
          <input type="date" className="input" {...register("date")} />
          {errors.date && (
            <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="label flex items-center gap-2">
            <FileText size={14} />
            Ghi chú (tùy chọn)
          </label>
          <textarea
            className="input min-h-[80px] resize-none rounded-xl"
            placeholder="Ví dụ: Sau buổi tập thể dục..."
            {...register("note")}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>
              <Scale size={18} />
              Ghi nhận
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
