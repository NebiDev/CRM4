export interface InvoiceLineItem {
    id?: string;
    description: string;
    quantity: number | string;
    unitPrice: number | string;
    amount?: string;
    position: number;
}

export interface Invoice {
    id: string;
    organizationId: string;
    clientId: string;
    projectId: string | null;
    number: string;
    status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
    currency: string;
    subtotal: string;
    taxAmount: string;
    total: string;
    issuedAt: string | null;
    dueDate: string | null;
    paidAt: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    client?: { id: string; name: string; email?: string | null; company?: string | null };
    project?: { id: string; name: string } | null;
    lineItems?: InvoiceLineItem[];
    _count?: { lineItems: number };
}

export interface ListInvoicesParams {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: Invoice["status"];
    clientId?: string;
    projectId?: string;
    sort?: "number" | "createdAt" | "dueDate" | "total";
    order?: "asc" | "desc";
}