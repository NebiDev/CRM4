import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { Paginated } from "@/lib/types";
import type { ListTasksParams, Task } from "./types";

export function useTasks(params: ListTasksParams = {}) {
    return useQuery({
        queryKey: qk.tasks.list(params),
        queryFn: async () => {
            const res = await apiGet<Paginated<Task>>("/api/tasks", params as any);
            return res;
        },
    });
}

export function useTask(id: string | undefined) {
    return useQuery({
        queryKey: qk.tasks.detail(id ?? ""),
        queryFn: async () => {
            const res = await apiGet<{ data: Task }>(`/api/tasks/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useCreateTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: Partial<Task>) => {
            const res = await apiPost<{ data: Task }>("/api/tasks", input);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Task created");
            qc.invalidateQueries({ queryKey: ["tasks"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useUpdateTask(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: Partial<Task>) => {
            const res = await apiPatch<{ data: Task }>(`/api/tasks/${id}`, input);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Task updated");
            qc.invalidateQueries({ queryKey: ["tasks"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useArchiveTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiDelete<{ data: Task }>(`/api/tasks/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Task archived");
            qc.invalidateQueries({ queryKey: ["tasks"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}