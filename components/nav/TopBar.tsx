"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function TopBar() {
  const [avatarEmoji, setAvatarEmoji] = useState("🐻");

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.avatarEmoji) setAvatarEmoji(data.avatarEmoji);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
        {/* App name with mascot */}
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="bear mascot">
            🐻
          </span>
          <h1 className="font-heading text-lg font-bold text-foreground">
            KiddyFit
          </h1>
        </div>

        {/* User avatar emoji */}
        <div
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
            "bg-muted hover:bg-border"
          )}
          aria-label="Hồ sơ của bạn"
        >
          <span className="text-xl">{avatarEmoji}</span>
        </div>
      </div>
    </header>
  );
}
