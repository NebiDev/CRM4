import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { qk } from "@/lib/query-keys";
import type { Paginated } from "@/lib/types";
import type { FileAsset } from "./types";

interface RequestUploadInput {
    filename: string;
    contentType: string;
    sizeBytes: number;
    // visibility?: "ORG" | "CLIENT";
    visibility?: "ORG" | "CLIENT" | undefined;
    clientId?: string | undefined;
    projectId?: string | undefined;
    invoiceId?: string | undefined;
}

export function useFiles(params: Record<string, unknown> = {}) {
    return useQuery({
        queryKey: qk.files.list(params),
        queryFn: async () => {
            const res = await apiGet<Paginated<FileAsset>>("/api/files", params as any);
            return res;
        },
    });
}

export function useUploadFile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (input: RequestUploadInput & { file: File }) => {
            // Step 1: ask the server for a presigned URL and a FileAsset row.
            const ticket = await apiPost<{
                data: { fileId: string; uploadUrl: string; bucketKey: string };
            }>("/api/files/upload-url", {
                filename: input.file.name,
                contentType: input.file.type || "application/octet-stream",
                sizeBytes: input.file.size,
                visibility: input.visibility ?? "ORG",
                clientId: input.clientId,
                projectId: input.projectId,
                invoiceId: input.invoiceId,
            });

            // Step 2: PUT the file directly to S3.
            const putRes = await fetch(ticket.data.uploadUrl, {
                method: "PUT",
                body: input.file,
                headers: { "Content-Type": input.file.type || "application/octet-stream" },
            });
            if (!putRes.ok) throw new Error("Upload to S3 failed");

            // Step 3: confirm so the server can verify existence.
            await apiPost("/api/files/confirm", { fileId: ticket.data.fileId });
            return ticket.data;
        },
        onSuccess: () => {
            toast.success("File uploaded");
            qc.invalidateQueries({ queryKey: ["files"] });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useDeleteFile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiDelete<{ data: FileAsset }>(`/api/files/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("File removed");
            qc.invalidateQueries({ queryKey: ["files"] });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export async function getDownloadUrl(fileId: string): Promise<string> {
    const res = await apiGet<{ data: { url: string } }>(`/api/files/${fileId}/download-url`);
    return res.data.url;
}