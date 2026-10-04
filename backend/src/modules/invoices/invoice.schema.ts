import { z } from "zod";

export const InvoiceStatusEnum = z.enum([
    "DRAFT",
    "SENT",
    "PAID",
    "OVERDUE",
    "VOID",
]);

export const InvoiceLineItemSchema = z.object({
    description: z.string().trim().min(1).max(500),
    quantity: z.coerce.number().positive().max(1_000_000),
    unitPrice: z.coerce.number().min(0).max(100_000_000),
    position: z.coerce.number().int().min(0).default(0),
});

export const CreateInvoiceSchema = z.object({
    clientId: z.string().min(1),
    projectId: z.string().optional(),
    currency: z.string().trim().length(3).toUpperCase().default("USD"),
    taxRate: z.coerce.number().min(0).max(1).default(0), // 0.075 = 7.5%
    dueDate: z.coerce.date().optional(),
    notes: z.string().trim().max(5000).optional().or(z.literal("")),
    lineItems: z.array(InvoiceLineItemSchema).min(1).max(100),
});

export const UpdateInvoiceSchema = z.object({
    taxRate: z.coerce.number().min(0).max(1).optional(),
    dueDate: z.coerce.date().optional(),
    notes: z.string().trim().max(5000).optional().or(z.literal("")),
    lineItems: z.array(InvoiceLineItemSchema).min(1).max(100).optional(),
});

export const InvoiceTransitionSchema = z.object({
    status: InvoiceStatusEnum,
});

export const ListInvoicesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(200).optional(),
    status: InvoiceStatusEnum.optional(),
    clientId: z.string().optional(),
    projectId: z.string().optional(),
    sort: z.enum(["number", "createdAt", "dueDate", "total"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;
export type ListInvoicesQuery = z.infer<typeof ListInvoicesQuerySchema>;