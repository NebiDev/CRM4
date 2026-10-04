import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { Paginated } from "@/lib/types";
import type { Client, ListClientsParams } from "./types";

export function useClients(params: ListClientsParams = {}) {
    return useQuery({
        queryKey: qk.clients.list(params),
        queryFn: async () => {
            const res = await apiGet<Paginated<Client>>("/api/clients", params as any);
            return res;
        },
    });
}

export function useClient(id: string | undefined) {
    return useQuery({
        queryKey: qk.clients.detail(id ?? ""),
        queryFn: async () => {
            const res = await apiGet<{ data: Client }>(`/api/clients/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useCreateClient() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: Partial<Client>) => {
            const res = await apiPost<{ data: Client }>("/api/clients", input);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Client created");
            qc.invalidateQueries({ queryKey: ["clients"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useUpdateClient(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: Partial<Client>) => {
            const res = await apiPatch<{ data: Client }>(`/api/clients/${id}`, input);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Client updated");
            qc.invalidateQueries({ queryKey: ["clients"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useArchiveClient() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiDelete<{ data: Client }>(`/api/clients/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Client archived");
            qc.invalidateQueries({ queryKey: ["clients"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}