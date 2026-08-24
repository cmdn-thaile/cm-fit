"use client";

import { useEffect, useRef } from "react";

/**
 * AuthSync component — runs once after page load to sync
 * the Auth0 user with our database. Placed in root layout.
 */
export function AuthSync() {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    // Sync user to DB after login
    fetch("/api/users/sync", { method: "POST" }).catch(() => {
      // Silently fail — user might not be logged in
    });
  }, []);

  return null;
}
