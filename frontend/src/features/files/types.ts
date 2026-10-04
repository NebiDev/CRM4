export interface FileAsset {
    id: string;
    organizationId: string;
    clientId: string | null;
    projectId: string | null;
    invoiceId: string | null;
    bucketKey: string;
    originalName: string;
    contentType: string;
    sizeBytes: number;
    visibility: "ORG" | "CLIENT";
    createdAt: string;
    deletedAt: string | null;
}