import { Prisma } from "@prisma/client";
import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { scopeProjects } from "../../shared/scopes.js";
import type { Actor } from "../../shared/types.js";
import { logActivity } from "../../shared/activity.js";
import type {
    CreateProjectInput,
    ListProjectsQuery,
    UpdateProjectInput,
} from "./project.schema.js";

function clean(obj: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== "") out[k] = v;
    }
    return out;
}

async function assertClientInOrg(actor: Actor, clientId: string) {
    const client = await db.client.findFirst({
        where: { id: clientId, organizationId: actor.organizationId },
        select: { id: true },
    });
    if (!client) throw AppError.badRequest("Client does not exist in this organization");
}

async function assertAssigneeInOrg(actor: Actor, userId: string) {
    const member = await db.member.findFirst({
        where: { userId, organizationId: actor.organizationId },
        select: { id: true },
    });
    if (!member) throw AppError.badRequest("Assignee is not a member of this organization");
}

export async function listProjects(actor: Actor, query: ListProjectsQuery) {
    const { page, pageSize, q, status, priority, clientId, assignedToId, sort, order } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProjectWhereInput = {
        ...scopeProjects(actor),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(clientId ? { clientId } : {}),
        ...(assignedToId ? { assignedToId } : {}),
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
                assignedTo: { select: { id: true, name: true } },
                _count: { select: { tasks: true } },
            },
        }),
        db.project.count({ where }),
    ]);

    return { rows, total, page, pageSize };
}

export async function getProject(actor: Actor, id: string) {
    const project = await db.project.findFirst({
        where: { id, ...scopeProjects(actor) },
        include: {
            client: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
            _count: { select: { tasks: true, files: true, invoices: true } },
        },
    });
    if (!project) throw AppError.notFound("Project not found");
    return project;
}

export async function createProject(actor: Actor, input: CreateProjectInput) {
    await assertClientInOrg(actor, input.clientId);
    if (input.assignedToId) await assertAssigneeInOrg(actor, input.assignedToId);

    const data = clean(input);
    const project = await db.project.create({
        data: {
            ...(data as any),
            organizationId: actor.organizationId,
            createdById: actor.userId,
        },
        include: {
            client: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
        },
    });

    await logActivity({
        organizationId: actor.organizationId,
        actorId: actor.userId,
        action: "project.created",
        entityType: "Project",
        entityId: project.id,
        projectId: project.id,
        clientId: project.clientId,
        metadata: { name: project.name },
    });

    return project;
}

export async function updateProject(actor: Actor, id: string, input: UpdateProjectInput) {
    await getProject(actor, id);

    if (input.assignedToId) await assertAssigneeInOrg(actor, input.assignedToId);

    const data = clean(input);
    const updated = await db.project.update({
        where: { id },
        data: data as any,
        include: {
            client: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
        },
    });

    await logActivity({
        organizationId: actor.organizationId,
        actorId: actor.userId,
        action: "project.updated",
        entityType: "Project",
        entityId: id,
        projectId: id,
    });

    return updated;
}

export async function archiveProject(actor: Actor, id: string) {
    await getProject(actor, id);
    const archived = await db.project.update({
        where: { id },
        data: { status: "ARCHIVED", archivedAt: new Date() },
    });

    await logActivity({
        organizationId: actor.organizationId,
        actorId: actor.userId,
        action: "project.archived",
        entityType: "Project",
        entityId: id,
        projectId: id,
    });

    return archived;
}