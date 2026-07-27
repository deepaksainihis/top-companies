import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toQueryParams, type ListParams } from "@/lib/list-params";
import { ApiItemResponse, ApiListResponse, Category } from "@/lib/types";

const KEY = "categories";

export const useCategoriesQuery = (params: ListParams) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: async () => {
      const res = await api.get<ApiListResponse<Category>>("/admin/categories", {
        params: toQueryParams(params),
      });
      return res.data;
    },
  });

// All active categories, unpaginated-ish (large limit) - used to populate
// the "Parent Category" select in the category form.
export const useAllCategoriesQuery = (excludeId?: number) =>
  useQuery({
    queryKey: [KEY, "all", excludeId],
    queryFn: async () => {
      const res = await api.get<ApiListResponse<Category>>("/admin/categories", {
        params: { limit: 200, status: "ACTIVE" },
      });
      return res.data.data.filter((c) => c.id !== excludeId);
    },
  });

export const useCategoryQuery = (id: number | undefined) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: async () => {
      const res = await api.get<ApiItemResponse<Category>>(`/admin/categories/${id}`);
      return res.data.data;
    },
    enabled: id !== undefined,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.post<ApiItemResponse<Category>>("/admin/categories", payload);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateCategory = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.patch<ApiItemResponse<Category>>(`/admin/categories/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useRestoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/admin/categories/${id}/restore`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const usePermanentlyDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/categories/${id}/permanent`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      await api.post("/admin/categories/bulk-delete", { ids });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useBulkRestoreCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      await api.post("/admin/categories/bulk-restore", { ids });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useBulkPermanentlyDeleteCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      await api.post("/admin/categories/bulk-permanent-delete", { ids });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useBulkUpdateCategoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: number[]; status: "ACTIVE" | "INACTIVE" }) => {
      await api.post("/admin/categories/bulk-status", { ids, status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};
