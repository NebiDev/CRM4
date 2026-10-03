import { z } from "zod";

export const ProjectStatusEnum = z.enum([
    "PLANNING",
    "ACTIVE",
    "ON_HOLD",
    "COMPLETED",
    "ARCHIVED",
]);

export const ProjectPriorityEnum = z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
]);

export const CreateProjectSchema = z.object({
    clientId: z.string().min(1),
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    status: ProjectStatusEnum.default("PLANNING"),
    priority: ProjectPriorityEnum.default("MEDIUM"),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    budget: z
        .union([z.number(), z.string()])
        .transform((v) => (v === "" ? undefined : String(v)))
        .optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
    // clientId shouldn't be changed after creation in MVP
    clientId: z.undefined().optional(),
});

export const ListProjectsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(200).optional(),
    status: ProjectStatusEnum.optional(),
    priority: ProjectPriorityEnum.optional(),
    clientId: z.string().optional(),
    sort: z.enum(["name", "createdAt", "dueDate", "updatedAt"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof ListProjectsQuerySchema>;