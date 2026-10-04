import { z } from "zod";

export const AgreementStatusEnum = z.enum(["DRAFT", "SENT", "SIGNED", "VOID"]);

export const CreateAgreementSchema = z.object({
    clientId: z.string().min(1),
    projectId: z.string().optional(),
    title: z.string().trim().min(1).max(200),
    version: z.string().trim().max(50).default("v1"),
    status: AgreementStatusEnum.default("DRAFT"),
    notes: z.string().trim().max(5000).optional().or(z.literal("")),
    fileId: z.string().min(1), // FileAsset id uploaded via /api/files/upload-url
});

export type CreateAgreementInput = z.infer<typeof CreateAgreementSchema>;