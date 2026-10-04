export interface Client {
    id: string;
    organizationId: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    archivedAt: string | null;
}

export interface ListClientsParams {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: Client["status"];
    sort?: "name" | "createdAt" | "updatedAt";
    order?: "asc" | "desc";
}