import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toQueryParams, type ListParams } from "@/lib/list-params";
import { ApiItemResponse, ApiListResponse } from "@/lib/types";

// The four masters (Country, TechStack, EmployeeRange, HourlyRateRange) hit
// identically-shaped CRUD endpoints on the backend's masters factory, so one
// generic hook builder covers all four instead of four near-duplicate files.
export const createMasterQueries = <T extends { id: number }>(resourcePath: string, key: string) => {
  const useList = (params: ListParams) =>
    useQuery({
      queryKey: [key, params],
      queryFn: async () => {
        const res = await api.get<ApiListResponse<T>>(`/admin/${resourcePath}`, {
          params: toQueryParams(params),
        });
        return res.data;
      },
    });

  const useOne = (id: number | undefined) =>
    useQuery({
      queryKey: [key, id],
      queryFn: async () => {
        const res = await api.get<ApiItemResponse<T>>(`/admin/${resourcePath}/${id}`);
        return res.data.data;
      },
      enabled: id !== undefined,
    });

  const useCreate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (payload: Record<string, unknown>) => {
        const res = await api.post<ApiItemResponse<T>>(`/admin/${resourcePath}`, payload);
        return res.data.data;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
    });
  };

  const useUpdate = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (payload: Record<string, unknown>) => {
        const res = await api.patch<ApiItemResponse<T>>(`/admin/${resourcePath}/${id}`, payload);
        return res.data.data;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
    });
  };

  const useRemove = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: number) => {
        await api.delete(`/admin/${resourcePath}/${id}`);
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
    });
  };

  const useRestore = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: number) => {
        await api.post(`/admin/${resourcePath}/${id}/restore`);
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
    });
  };

  const usePermanentlyDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: number) => {
        await api.delete(`/admin/${resourcePath}/${id}/permanent`);
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
    });
  };

  const useBulkDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (ids: number[]) => {
        await api.post(`/admin/${resourcePath}/bulk-delete`, { ids });
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
    });
  };

  const useBulkRestore = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (ids: number[]) => {
        await api.post(`/admin/${resourcePath}/bulk-restore`, { ids });
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
    });
  };

  const useBulkPermanentlyDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (ids: number[]) => {
        await api.post(`/admin/${resourcePath}/bulk-permanent-delete`, { ids });
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
    });
  };

  const useBulkStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ ids, status }: { ids: number[]; status: "ACTIVE" | "INACTIVE" }) => {
        await api.post(`/admin/${resourcePath}/bulk-status`, { ids, status });
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
    });
  };

  return {
    useList,
    useOne,
    useCreate,
    useUpdate,
    useRemove,
    useRestore,
    usePermanentlyDelete,
    useBulkDelete,
    useBulkRestore,
    useBulkPermanentlyDelete,
    useBulkStatus,
  };
};
