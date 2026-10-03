import { z } from "zod";

export const TaskStatusEnum = z.enum([
    "TODO",
    "IN_PROGRESS",
    "REVIEW",
    "COMPLETED",
    "ARCHIVED",
]);

export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const CreateTaskSchema = z.object({
    projectId: z.string().min(1),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    status: TaskStatusEnum.default("TODO"),
    priority: TaskPriorityEnum.default("MEDIUM"),
    dueDate: z.coerce.date().optional(),
    assignedToId: z.string().optional().nullable(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
    projectId: z.undefined().optional(),
});

export const ListTasksQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(200).optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    projectId: z.string().optional(),
    assignedToId: z.string().optional(),
    sort: z.enum(["title", "createdAt", "dueDate", "updatedAt"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type ListTasksQuery = z.infer<typeof ListTasksQuerySchema>;