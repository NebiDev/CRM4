import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { assertSameOrg } from "../../shared/tenant.js";
import type {
    CreateClientInput,
    ListClientsQuery,
    UpdateClientInput,
} from "./client.schema.js";
import { logActivity } from "../../shared/activity.js";

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== "") out[k] = v;
    }
    return out as Partial<T>;
}

export async function listClients(
    organizationId: string,
    query: ListClientsQuery,
) {
    const { page, pageSize, q, status, sort, order } = query;
    const skip = (page - 1) * pageSize;

    const where = {
        organizationId,
        ...(status ? { status } : {}),
        ...(q
            ? {
                OR: [
                    { name: { contains: q, mode: "insensitive" as const } },
                    { email: { contains: q, mode: "insensitive" as const } },
                    { company: { contains: q, mode: "insensitive" as const } },
                ],
            }
            : {}),
    };

    const [rows, total] = await Promise.all([
        db.client.findMany({
            where,
            orderBy: { [sort]: order },
            skip,
            take: pageSize,
        }),
        db.client.count({ where }),
    ]);

    return { rows, total, page, pageSize };
}

export async function getClient(organizationId: string, id: string) {
    const client = await db.client.findUnique({ where: { id } });
    assertSameOrg(client, organizationId);
    return client!;
}

export async function createClient(
    organizationId: string,
    userId: string,
    input: CreateClientInput,
) {
    const data = clean(input);

    // Unique per-org email guard (empty emails are not unique-checked).
    if (data.email) {
        const existing = await db.client.findFirst({
            where: { organizationId, email: data.email },
        });
        if (existing) {
            throw AppError.conflict("A client with that email already exists");
        }
    }

    const client = await db.client.create({
        data: {
            ...(data as any),
            organizationId,
            createdById: userId,
        },
    });

    await logActivity({
        organizationId,
        actorId: userId,
        action: "client.created",
        entityType: "Client",
        entityId: client.id,
        clientId: client.id,
        metadata: { name: client.name },
    });

    return client;
}

export async function updateClient(
    organizationId: string,
    userId: string,
    id: string,
    input: UpdateClientInput,
) {
    const existing = await getClient(organizationId, id);
    const data = clean(input);

    if (data.email && data.email !== existing.email) {
        const dup = await db.client.findFirst({
            where: { organizationId, email: data.email, NOT: { id } },
        });
        if (dup) {
            throw AppError.conflict("A client with that email already exists");
        }
    }

    const updated = await db.client.update({ where: { id }, data });

    await logActivity({
        organizationId,
        actorId: userId,
        action: "client.updated",
        entityType: "Client",
        entityId: id,
        clientId: id,
    });

    return updated;
}

export async function archiveClient(
    organizationId: string,
    userId: string,
    id: string,
) {
    await getClient(organizationId, id);
    const archived = await db.client.update({
        where: { id },
        data: { status: "ARCHIVED", archivedAt: new Date() },
    });

    await logActivity({
        organizationId,
        actorId: userId,
        action: "client.archived",
        entityType: "Client",
        entityId: id,
        clientId: id,
    });

    return archived;
}