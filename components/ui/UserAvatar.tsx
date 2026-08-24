"use client";

import { cn } from "@/lib/utils";
import { HOODS, DEFAULT_HOOD } from "@/lib/hoods";

interface UserAvatarProps {
  avatarUrl?: string | null;
  hood?: string;
  displayName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeConfig = {
  sm: {
    avatar: 32,
    hoodWidth: 63,
    hoodHeight: 42,
    padding: 18,
  },
  md: {
    avatar: 56,
    hoodWidth: 110,
    hoodHeight: 74,
    padding: 32,
  },
  lg: {
    avatar: 68,
    hoodWidth: 179,
    hoodHeight: 98,
    padding: 46,
  },
  xl: {
    avatar: 112,
    hoodWidth: 220,
    hoodHeight: 148,
    padding: 64,
  },
};

export function UserAvatar({
  avatarUrl,
  hood,
  displayName = "",
  size = "md",
  className,
}: UserAvatarProps) {
  const config = sizeConfig[size];

  const hoodId = hood || DEFAULT_HOOD;
  const hoodData = HOODS.find((h) => h.id === hoodId) || HOODS[0];

  return (
    <div
      className={cn("relative inline-flex flex-col items-center overflow-visible", className)}
      style={{
        width: `${config.hoodWidth}px`,
        paddingTop: config.padding,
      }}
    >
      {/* Hood image — wider than avatar, centered */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hoodData.image}
        alt={hoodData.name}
        className="absolute z-10 pointer-events-none left-0 top-0"
        style={{
          width: `${config.hoodWidth}px`,
          height: `${config.hoodHeight}px`,
        }}
      />

      {/* Avatar circle — centered within the wider wrapper */}
      <div
        className="rounded-full overflow-hidden border-2 border-white shadow-soft bg-muted flex items-center justify-center relative mx-auto"
        style={{ width: `${config.avatar}px`, height: `${config.avatar}px` }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-muted-foreground font-bold text-lg">
            {displayName.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
    </div>
  );
}
