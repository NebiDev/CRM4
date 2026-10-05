import { z } from "zod";

export const ClientStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

export const CreateClientSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().email("Invalid email").toLowerCase().optional().or(z.literal("")),
    
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    company: z.string().trim().max(200).optional().or(z.literal("")),
    status: ClientStatusEnum.default("ACTIVE"),
    notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const UpdateClientSchema = CreateClientSchema.partial();

export const ListClientsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(200).optional(),
    status: ClientStatusEnum.optional(),
    sort: z
        .enum(["name", "createdAt", "updatedAt"])
        .default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type ListClientsQuery = z.infer<typeof ListClientsQuerySchema>;