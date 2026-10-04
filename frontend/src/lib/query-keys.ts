export const qk = {
    dashboard: {
        summary: ["dashboard", "summary"] as const,
        activity: (limit: number) => ["dashboard", "activity", limit] as const,
    },
    clients: {
        list: (params?: Record<string, unknown>) => ["clients", "list", params ?? {}] as const,
        detail: (id: string) => ["clients", "detail", id] as const,
    },
    projects: {
        list: (params?: Record<string, unknown>) => ["projects", "list", params ?? {}] as const,
        detail: (id: string) => ["projects", "detail", id] as const,
    },
    tasks: {
        list: (params?: Record<string, unknown>) => ["tasks", "list", params ?? {}] as const,
        detail: (id: string) => ["tasks", "detail", id] as const,
    },
    invoices: {
        list: (params?: Record<string, unknown>) => ["invoices", "list", params ?? {}] as const,
        detail: (id: string) => ["invoices", "detail", id] as const,
    },
    files: {
        list: (params?: Record<string, unknown>) => ["files", "list", params ?? {}] as const,
    },
    agreements: {
        list: ["agreements", "list"] as const,
    },
};