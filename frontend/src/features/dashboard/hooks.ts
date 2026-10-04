import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { ActivityEntry, DashboardSummary } from "@/lib/types";

export function useDashboardSummary() {
    return useQuery({
        queryKey: qk.dashboard.summary,
        queryFn: async () => {
            const res = await apiGet<{ data: DashboardSummary }>("/api/dashboard/summary");
            return res.data;
        },
    });
}

export function useActivity(limit = 10) {
    return useQuery({
        queryKey: qk.dashboard.activity(limit),
        queryFn: async () => {
            const res = await apiGet<{ data: ActivityEntry[] }>("/api/dashboard/activity", { limit });
            return res.data;
        },
    });
}