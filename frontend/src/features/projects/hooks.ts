import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { Paginated } from "@/lib/types";
import type { ListProjectsParams, Project } from "./types";

export function useProjects(params: ListProjectsParams = {}) {
    return useQuery({
        queryKey: qk.projects.list(params),
        queryFn: async () => {
            const res = await apiGet<Paginated<Project>>("/api/projects", params as any);
            return res;
        },
    });
}

export function useProject(id: string | undefined) {
    return useQuery({
        queryKey: qk.projects.detail(id ?? ""),
        queryFn: async () => {
            const res = await apiGet<{ data: Project }>(`/api/projects/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useCreateProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: Partial<Project>) => {
            const res = await apiPost<{ data: Project }>("/api/projects", input);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Project created");
            qc.invalidateQueries({ queryKey: ["projects"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useUpdateProject(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: Partial<Project>) => {
            const res = await apiPatch<{ data: Project }>(`/api/projects/${id}`, input);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Project updated");
            qc.invalidateQueries({ queryKey: ["projects"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useArchiveProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiDelete<{ data: Project }>(`/api/projects/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Project archived");
            qc.invalidateQueries({ queryKey: ["projects"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}