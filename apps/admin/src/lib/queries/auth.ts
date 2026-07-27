import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { AdminProfile, useAuthStore } from "@/lib/auth-store";
import { ApiItemResponse } from "@/lib/types";

interface LoginResponseData {
  admin: AdminProfile;
  accessToken: string;
}

export const useLogin = () => {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await api.post<ApiItemResponse<LoginResponseData>>("/auth/login", payload);
      return res.data.data;
    },
    onSuccess: ({ admin, accessToken }) => setSession(admin, accessToken),
  });
};

export const useLogout = () => {
  const clearSession = useAuthStore((s) => s.clearSession);
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSettled: () => clearSession(),
  });
};

export const useForgotPassword = () =>
  useMutation({
    mutationFn: async (payload: { email: string }) => {
      const res = await api.post<{ success: true; message: string }>("/auth/forgot-password", payload);
      return res.data;
    },
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: async (payload: { email: string; token: string; password: string }) => {
      const res = await api.post<{ success: true; message: string }>("/auth/reset-password", payload);
      return res.data;
    },
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const res = await api.patch<{ success: true; message: string }>("/auth/change-password", payload);
      return res.data;
    },
  });

export const useUpdateProfile = () => {
  const updateAdmin = useAuthStore((s) => s.updateAdmin);
  return useMutation({
    mutationFn: async (payload: { name?: string; avatar?: string | null }) => {
      const res = await api.patch<ApiItemResponse<AdminProfile>>("/auth/profile", payload);
      return res.data.data;
    },
    onSuccess: (admin) => updateAdmin(admin),
  });
};
