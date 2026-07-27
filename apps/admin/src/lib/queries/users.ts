import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toQueryParams, type ListParams } from "@/lib/list-params";
import { AdminUser, ApiItemResponse, ApiListResponse } from "@/lib/types";

const KEY = "users";

export const useUsersQuery = (params: ListParams) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: async () => {
      const res = await api.get<ApiListResponse<AdminUser>>("/admin/users", {
        params: toQueryParams(params),
      });
      return res.data;
    },
  });

export const useUserQuery = (id: number | undefined) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: async () => {
      const res = await api.get<ApiItemResponse<AdminUser>>(`/admin/users/${id}`);
      return res.data.data;
    },
    enabled: id !== undefined,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.post<ApiItemResponse<AdminUser>>("/admin/users", payload);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateUser = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.patch<ApiItemResponse<AdminUser>>(`/admin/users/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};
