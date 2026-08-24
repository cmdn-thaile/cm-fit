"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { onProfileUpdate } from "@/lib/events";

interface UserData {
  displayName: string;
  avatarUrl?: string | null;
  avatarEmoji?: string;
}

export function TopBar() {
  const [user, setUser] = useState<UserData | null>(null);

  const fetchUser = useCallback(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.displayName) setUser(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchUser();
    // Re-fetch when profile is updated anywhere in the app
    const unsubscribe = onProfileUpdate(fetchUser);
    return () => { unsubscribe(); };
  }, [fetchUser]);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
        {/* App name with mascot */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🐻</span>
          <h1 className="font-heading text-lg font-bold text-foreground">
            KiddyFit
          </h1>
        </Link>

        {/* User avatar with hood */}
        <Link href="/profile">
          <UserAvatar
            avatarUrl={user?.avatarUrl}
            hood={user?.avatarEmoji || "bear"}
            displayName={user?.displayName || ""}
            size="sm"
          />
        </Link>
      </div>
    </header>
  );
}
