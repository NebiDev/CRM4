import { Prisma } from "@prisma/client";
import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { assertSameOrg } from "../../shared/tenant.js";
import type {
    CreateProjectInput,
    ListProjectsQuery,
    UpdateProjectInput,
} from "./project.schema.js";
import { logActivity } from "../../shared/activity.js";


function clean<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== "") out[k] = v;
    }
    return out;
}

async function assertClientInOrg(organizationId: string, clientId: string) {
    const client = await db.client.findFirst({
        where: { id: clientId, organizationId },
        select: { id: true },
    });
    if (!client) throw AppError.badRequest("Client does not exist in this organization");
}

export async function listProjects(organizationId: string, query: ListProjectsQuery) {
    const { page, pageSize, q, status, priority, clientId, sort, order } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProjectWhereInput = {
        organizationId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(clientId ? { clientId } : {}),
        ...(q
            ? {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                ],
            }
            : {}),
    };

    const [rows, total] = await Promise.all([
        db.project.findMany({
            where,
            orderBy: { [sort]: order },
            skip,
            take: pageSize,
            include: {
                client: { select: { id: true, name: true } },
                _count: { select: { tasks: true } },
            },
        }),
        db.project.count({ where }),
    ]);

    return { rows, total, page, pageSize };
}

export async function getProject(organizationId: string, id: string) {
    const project = await db.project.findUnique({
        where: { id },
        include: {
            client: { select: { id: true, name: true } },
            _count: { select: { tasks: true, files: true, invoices: true } },
        },
    });
    assertSameOrg(project, organizationId);
    return project!;
}

export async function createProject(
    organizationId: string,
    userId: string,
    input: CreateProjectInput,
) {
    await assertClientInOrg(organizationId, input.clientId);

    const data = clean(input);
    const project = await db.project.create({
        data: {
            ...(data as any),
            organizationId,
            createdById: userId,
        },
        include: {
            client: { select: { id: true, name: true } },
        },
    });

    await logActivity({
        organizationId,
        actorId: userId,
        action: "project.created",
        entityType: "Project",
        entityId: project.id,
        clientId: project.clientId,
        metadata: { name: project.name },
    });

    return project;
}

export async function updateProject(
    organizationId: string,
    userId: string,
    id: string,
    input: UpdateProjectInput,
) {
    const existing = await getProject(organizationId, id);
    if (input.clientId && input.clientId !== existing.clientId) {
        await assertClientInOrg(organizationId, input.clientId);
    }


    const data = clean(input);
    const updated = await db.project.update({
        where: { id },
        data: data as any,
        include: {
            client: { select: { id: true, name: true } },
        },
    });

    await logActivity({
        organizationId,
        actorId: userId,
        action: "project.updated",
        entityType: "Project",
        entityId: updated.id,
        clientId: updated.clientId,
        metadata: { name: updated.name },
    });

    return updated;
}

export async function archiveProject(
    organizationId: string,
    userId: string,
    id: string,
) {
    const existing = await getProject(organizationId, id);

    const archived = await db.project.update({
        where: { id },
        data: { status: "ARCHIVED", archivedAt: new Date() },
    });

    await logActivity({
        organizationId,
        actorId: userId,
        action: "project.archived",
        entityType: "Project",
        entityId: archived.id,
        clientId: existing.clientId,
        metadata: { name: existing.name },
    });

    return archived;
}