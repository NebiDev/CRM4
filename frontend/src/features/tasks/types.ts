export interface Task {
    id: string;
    organizationId: string;
    projectId: string;
    title: string;
    description: string | null;
    status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | "ARCHIVED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate: string | null;
    assignedToId: string | null;
    createdAt: string;
    updatedAt: string;
    archivedAt: string | null;
    project?: { id: string; name: string };
    assignedTo?: { id: string; name: string | null } | null;
}

export interface ListTasksParams {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: Task["status"];
    priority?: Task["priority"];
    projectId?: string;
    assignedToId?: string;
    sort?: "title" | "createdAt" | "dueDate" | "updatedAt";
    order?: "asc" | "desc";
}