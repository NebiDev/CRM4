import { db } from "../config/db.js";

export type ActivityEntity = "Client" | "Project" | "Task" | "Invoice" | "File" | "Organization";

export interface LogActivityInput {
    organizationId: string;
    actorId: string;
    action: string;         // "client.created", "invoice.issued", ...
    entityType: ActivityEntity;
    entityId: string;
    metadata?: Record<string, unknown>;
    clientId?: string;
    projectId?: string;
    taskId?: string;
    invoiceId?: string;
}

/**
 * Fire-and-forget activity log write. Logging must never break the
 * request that triggered it, so failures are swallowed with a warning.
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
    try {
        await db.activityLog.create({
            data: {
                organizationId: input.organizationId,
                actorId: input.actorId,
                action: input.action,
                entityType: input.entityType,
                entityId: input.entityId,
                metadata: input.metadata ?? undefined,
                clientId: input.clientId,
                projectId: input.projectId,
                taskId: input.taskId,
                invoiceId: input.invoiceId,
            },
        });
    } catch (err) {
        // Intentionally not thrown — activity logging is best-effort.
        console.warn("[activity] failed to log", input.action, err);
    }
}