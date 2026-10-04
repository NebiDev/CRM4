export interface Paginated<T> {
    data: T[];
    meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface DashboardSummary {
    role: "owner" | "admin" | "staff" | "client";
    cards: Array<{ label: string; value: number | string; hint?: string }>;
    charts: {
        projectsByStatus: Array<{ status: string; count: number }>;
        tasksByStatus: Array<{ status: string; count: number }>;
        revenueByMonth: Array<{ month: string; total: string }>;
    };
    recent: {
        projects: Array<{ id: string; name: string; status: string; updatedAt: string }>;
        tasks: Array<{ id: string; title: string; status: string; updatedAt: string }>;
    };
}

export interface ActivityEntry {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    actor: { id: string; name: string | null; email: string } | null;
}