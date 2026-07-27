import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toQueryParams, type ListParams } from "@/lib/list-params";
import { ApiItemResponse, ApiListResponse, Company } from "@/lib/types";

const KEY = "companies";

export const useCompaniesQuery = (params: ListParams) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: async () => {
      const res = await api.get<ApiListResponse<Company>>("/admin/companies", {
        params: toQueryParams(params),
      });
      return res.data;
    },
  });

export const useCompanyQuery = (id: number | undefined) =>
  useQuery({
    queryKey: [KEY, id],
    queryFn: async () => {
      const res = await api.get<ApiItemResponse<Company>>(`/admin/companies/${id}`);
      return res.data.data;
    },
    enabled: id !== undefined,
  });

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.post<ApiItemResponse<Company>>("/admin/companies", payload);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateCompany = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.patch<ApiItemResponse<Company>>(`/admin/companies/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/companies/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useRestoreCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/admin/companies/${id}/restore`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const usePermanentlyDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/companies/${id}/permanent`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useBulkDeleteCompanies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      await api.post("/admin/companies/bulk-delete", { ids });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useBulkRestoreCompanies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      await api.post("/admin/companies/bulk-restore", { ids });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useBulkPermanentlyDeleteCompanies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      await api.post("/admin/companies/bulk-permanent-delete", { ids });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useBulkUpdateCompanyStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: number[]; status: "ACTIVE" | "INACTIVE" }) => {
      await api.post("/admin/companies/bulk-status", { ids, status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};
