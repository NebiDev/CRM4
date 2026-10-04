import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { Paginated } from "@/lib/types";
import type { Invoice, ListInvoicesParams } from "./types";

export function useInvoices(params: ListInvoicesParams = {}) {
    return useQuery({
        queryKey: qk.invoices.list(params),
        queryFn: async () => {
            const res = await apiGet<Paginated<Invoice>>("/api/invoices", params as any);
            return res;
        },
    });
}

export function useInvoice(id: string | undefined) {
    return useQuery({
        queryKey: qk.invoices.detail(id ?? ""),
        queryFn: async () => {
            const res = await apiGet<{ data: Invoice }>(`/api/invoices/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useCreateInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: Partial<Invoice> & { lineItems: any[]; taxRate?: number }) => {
            const res = await apiPost<{ data: Invoice }>("/api/invoices", input);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Invoice created");
            qc.invalidateQueries({ queryKey: ["invoices"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useUpdateInvoice(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: Partial<Invoice> & { lineItems?: any[]; taxRate?: number }) => {
            const res = await apiPatch<{ data: Invoice }>(`/api/invoices/${id}`, input);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Invoice updated");
            qc.invalidateQueries({ queryKey: ["invoices"] });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useTransitionInvoice(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (status: Invoice["status"]) => {
            const res = await apiPost<{ data: Invoice }>(`/api/invoices/${id}/transition`, { status });
            return res.data;
        },
        onSuccess: (inv) => {
            toast.success(`Invoice ${inv.status.toLowerCase()}`);
            qc.invalidateQueries({ queryKey: ["invoices"] });
            qc.invalidateQueries({ queryKey: qk.dashboard.summary });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useGenerateInvoicePdf(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const res = await apiPost<{ data: { id: string; bucketKey: string } }>(
                `/api/invoices/${id}/pdf`,
                {},
            );
            return res.data;
        },
        onSuccess: () => {
            toast.success("PDF generated");
            qc.invalidateQueries({ queryKey: ["files"] });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}