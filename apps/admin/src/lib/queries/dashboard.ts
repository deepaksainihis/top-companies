import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ApiItemResponse, DashboardData } from "@/lib/types";

export const useDashboardQuery = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get<ApiItemResponse<DashboardData>>("/admin/dashboard");
      return res.data.data;
    },
  });
