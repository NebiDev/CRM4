import { Prisma } from "@prisma/client";
import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { scopeClients } from "../../shared/scopes.js";
import type { Actor } from "../../shared/types.js";
import { logActivity } from "../../shared/activity.js";
import type {
    CreateClientInput,
    ListClientsQuery,
    UpdateClientInput,
} from "./client.schema.js";

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== "") out[k] = v;
    }
    return out as Partial<T>;
}

export async function listClients(actor: Actor, query: ListClientsQuery) {
    const { page, pageSize, q, status, sort, order } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ClientWhereInput = {
        ...scopeClients(actor),
        ...(status ? { status } : {}),
        ...(q
            ? {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                    { company: { contains: q, mode: "insensitive" } },
                ],
            }
            : {}),
    };

    const [rows, total] = await Promise.all([
        db.client.findMany({ where, orderBy: { [sort]: order }, skip, take: pageSize }),
        db.client.count({ where }),
    ]);

    return { rows, total, page, pageSize };
}

export async function getClient(actor: Actor, id: string) {
    const client = await db.client.findFirst({
        where: { id, ...scopeClients(actor) },
    });
    if (!client) throw AppError.notFound("Client not found");
    return client;
}

export async function createClient(actor: Actor, input: CreateClientInput) {
    const data = clean(input);

    if (data.email) {
        const existing = await db.client.findFirst({
            where: { organizationId: actor.organizationId, email: data.email },
        });
        if (existing) throw AppError.conflict("A client with that email already exists");
    }

    const client = await db.client.create({
        data: {
            name: input.name,                    // required — taken from the validated input
            email: data.email,
            phone: data.phone,
            company: data.company,
            notes: data.notes,
            status: input.status ?? "ACTIVE",
            organizationId: actor.organizationId,
            createdById: actor.userId,
        },
    });

    await logActivity({
        organizationId: actor.organizationId,
        actorId: actor.userId,
        action: "client.created",
        entityType: "Client",
        entityId: client.id,
        clientId: client.id,
        metadata: { name: client.name },
    });

    return client;
}

export async function updateClient(actor: Actor, id: string, input: UpdateClientInput) {
    const existing = await getClient(actor, id);
    const data = clean(input);

    if (data.email && data.email !== existing.email) {
        const dup = await db.client.findFirst({
            where: { organizationId: actor.organizationId, email: data.email, NOT: { id } },
        });
        if (dup) throw AppError.conflict("A client with that email already exists");
    }

    const updated = await db.client.update({
        where: { id },
        data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.email !== undefined ? { email: data.email } : {}),
            ...(data.phone !== undefined ? { phone: data.phone } : {}),
            ...(data.company !== undefined ? { company: data.company } : {}),
            ...(data.notes !== undefined ? { notes: data.notes } : {}),
            ...(data.status !== undefined ? { status: data.status } : {}),
        },
    });

    await logActivity({
        organizationId: actor.organizationId,
        actorId: actor.userId,
        action: "client.updated",
        entityType: "Client",
        entityId: id,
        clientId: id,
    });

    return updated;
}

export async function archiveClient(actor: Actor, id: string) {
    await getClient(actor, id);
    const archived = await db.client.update({
        where: { id },
        data: { status: "ARCHIVED", archivedAt: new Date() },
    });

    await logActivity({
        organizationId: actor.organizationId,
        actorId: actor.userId,
        action: "client.archived",
        entityType: "Client",
        entityId: id,
        clientId: id,
    });

    return archived;
}