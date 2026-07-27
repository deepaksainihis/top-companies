import { create } from "zustand";

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  admin: AdminProfile | null;
  accessToken: string | null;
  status: AuthStatus;
  setSession: (admin: AdminProfile, accessToken: string) => void;
  updateAdmin: (admin: AdminProfile) => void;
  clearSession: () => void;
}

// The access token is deliberately kept only in memory (never localStorage)
// so it can't be read by injected/XSS'd scripts persisted across reloads -
// the httpOnly refresh cookie is what survives a page refresh.
export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  accessToken: null,
  status: "loading",
  setSession: (admin, accessToken) => set({ admin, accessToken, status: "authenticated" }),
  updateAdmin: (admin) => set({ admin }),
  clearSession: () => set({ admin: null, accessToken: null, status: "unauthenticated" }),
}));
