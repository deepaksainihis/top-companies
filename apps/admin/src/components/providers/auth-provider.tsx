"use client";

import { useEffect } from "react";
import { bootstrapSession } from "@/lib/api-client";
import { useAuthStore } from "@/lib/auth-store";

// Runs once on app load: the httpOnly refresh cookie (invisible to JS)
// survives a page refresh even though the in-memory access token doesn't,
// so we silently exchange it for a fresh access token here before any
// protected route renders.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    let cancelled = false;

    bootstrapSession()
      .then(({ admin, accessToken }) => {
        if (!cancelled) setSession(admin, accessToken);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
