import { z } from "zod";

export const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "text/plain",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",       // .xlsx
] as const;

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const FileVisibilityEnum = z.enum(["ORG", "CLIENT"]);

export const RequestUploadSchema = z.object({
    filename: z.string().trim().min(1).max(255),
    contentType: z.string().trim().min(1),
    sizeBytes: z.coerce.number().int().positive().max(MAX_FILE_SIZE_BYTES),
    visibility: FileVisibilityEnum.default("ORG"),
    clientId: z.string().optional(),
    projectId: z.string().optional(),
    invoiceId: z.string().optional(),
});

export const ConfirmUploadSchema = z.object({
    fileId: z.string().min(1),
});

export const ListFilesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    clientId: z.string().optional(),
    projectId: z.string().optional(),
    invoiceId: z.string().optional(),
});

export type RequestUploadInput = z.infer<typeof RequestUploadSchema>;
export type ConfirmUploadInput = z.infer<typeof ConfirmUploadSchema>;
export type ListFilesQuery = z.infer<typeof ListFilesQuerySchema>;