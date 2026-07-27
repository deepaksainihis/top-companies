import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ApiItemResponse, SettingsData } from "@/lib/types";
import { SettingsFormValues } from "@/lib/schemas/settings";

const KEY = "settings";

export const useSettingsQuery = () =>
  useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const res = await api.get<ApiItemResponse<SettingsData>>("/admin/settings");
      return res.data.data;
    },
  });

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SettingsFormValues) => {
      const res = await api.put<ApiItemResponse<SettingsData>>("/admin/settings", payload);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY] }),
  });
};
