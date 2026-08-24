"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Edit3, Save, LogOut, Calendar, User as UserIcon, Mail } from "lucide-react";
import { MascotCard } from "@/components/ui/MascotCard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { HOODS } from "@/lib/hoods";
import { emitProfileUpdate } from "@/lib/events";

interface UserProfile {
  id: string;
  displayName: string;
  avatarEmoji: string;
  avatarUrl?: string | null;
  email: string;
  dateOfBirth: string;
  gender: string;
  createdAt: string;
  _count?: {
    measurements: number;
    achievements: number;
  };
}

interface EditFormData {
  displayName: string;
  dateOfBirth: string;
  gender: string;
  avatarEmoji: string;
}

const HOOD_OPTIONS = HOODS;

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<EditFormData>();
  const selectedEmoji = watch("avatarEmoji");

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        reset({
          displayName: data.displayName,
          dateOfBirth: data.dateOfBirth
            ? format(new Date(data.dateOfBirth), "yyyy-MM-dd")
            : "",
          gender: data.gender || "male",
          avatarEmoji: data.avatarEmoji || "bear",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [reset]);

  const onSave = async (data: EditFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Lỗi khi cập nhật");
      const updated = await res.json();
      setUser(updated);
      setEditing(false);
      emitProfileUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl animate-bounce">🐻</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      className="px-4 py-6 pb-24 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Avatar & Name */}
      <div className="text-center flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <UserAvatar
            avatarUrl={user.avatarUrl}
            hood={user.avatarEmoji || "bear"}
            displayName={user.displayName}
            size="xl"
          />
        </motion.div>
        <h2 className="text-2xl font-heading font-bold mt-3">{user.displayName}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      {/* Mascot */}
      <MascotCard
        emoji="🐻"
        message={`Tuyệt vời lắm ${user.displayName}! Tiếp tục theo dõi sức khỏe mỗi ngày nhé! 💪`}
        variant="success"
      />

      {/* Profile info / Edit form */}
      {!editing ? (
        <motion.div className="card space-y-4" layout>
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold">Thông tin cá nhân</h3>
            <button
              onClick={() => setEditing(true)}
              className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-1.5"
            >
              <Edit3 size={14} />
              Sửa
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tên hiển thị</p>
                <p className="text-sm font-medium">{user.displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ngày sinh</p>
                <p className="text-sm font-medium">
                  {user.dateOfBirth
                    ? format(new Date(user.dateOfBirth), "dd/MM/yyyy", { locale: vi })
                    : "Chưa cập nhật"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base">⚧</span>
              <div>
                <p className="text-xs text-muted-foreground">Giới tính</p>
                <p className="text-sm font-medium">
                  {user.gender === "male" ? "Nam" : user.gender === "female" ? "Nữ" : "Khác"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.form
          className="card space-y-4"
          onSubmit={handleSubmit(onSave)}
          layout
        >
          <h3 className="font-heading font-bold">Chỉnh sửa hồ sơ</h3>

          {/* Hood Picker */}
          <div>
            <label className="label">Mũ thú cưng</label>
            <div className="grid grid-cols-4 gap-3">
              {HOOD_OPTIONS.map((hood) => (
                <button
                  key={hood.id}
                  type="button"
                  onClick={() => setValue("avatarEmoji", hood.id)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                    selectedEmoji === hood.id
                      ? "bg-primary-light/50 ring-2 ring-primary scale-105"
                      : "bg-muted hover:bg-border"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hood.image}
                    alt={hood.name}
                    className="w-14 h-14 object-contain"
                  />
                  <span className="text-[10px] mt-1 font-medium text-muted-foreground">
                    {hood.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="label">Tên hiển thị</label>
            <input
              type="text"
              className="input"
              {...register("displayName")}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="label">Ngày sinh</label>
            <input
              type="date"
              className="input"
              {...register("dateOfBirth")}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="label">Giới tính</label>
            <select className="input" {...register("gender")}>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-secondary flex-1"
            >
              Hủy
            </button>
          </div>
        </motion.form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-dark">
            {user._count?.measurements || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">Lần đo</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">
            {user._count?.achievements || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">Thành tựu</p>
        </div>
        <div className="card text-center">
          <p className="text-xs font-bold text-blue-600">
            {user.createdAt
              ? format(new Date(user.createdAt), "MM/yyyy", { locale: vi })
              : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">Tham gia</p>
        </div>
      </div>

      {/* Logout */}
      <a
        href="/api/auth/logout"
        className="btn-secondary w-full flex items-center justify-center gap-2 text-red-500"
      >
        <LogOut size={16} />
        Đăng xuất
      </a>
    </motion.div>
  );
}
