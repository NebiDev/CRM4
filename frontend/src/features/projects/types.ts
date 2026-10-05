export interface Project {
    id: string;
    organizationId: string;
    clientId: string;
    name: string;
    description: string | null;
    status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assignedToId: string | null;
    assignedTo?: { id: string; name: string | null } | null;
    startDate: string | null;
    dueDate: string | null;
    budget: string | null;
    createdAt: string;
    updatedAt: string;
    archivedAt: string | null;
    client?: { id: string; name: string };
    _count?: { tasks: number };
}

export interface ListProjectsParams {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: Project["status"];
    priority?: Project["priority"];
    clientId?: string;
    sort?: "name" | "createdAt" | "dueDate" | "updatedAt";
    order?: "asc" | "desc";
}