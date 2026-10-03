import { Prisma } from "@prisma/client";
import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { assertSameOrg } from "../../shared/tenant.js";
import type {
    CreateProjectInput,
    ListProjectsQuery,
    UpdateProjectInput,
} from "./project.schema.js";

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
    return db.project.create({
        data: {
            ...(data as any),
            organizationId,
            createdById: userId,
        },
        include: {
            client: { select: { id: true, name: true } },
        },
    });
}

export async function updateProject(
    organizationId: string,
    id: string,
    input: UpdateProjectInput,
) {
    await getProject(organizationId, id); // ensures exists + scoped
    const data = clean(input);

    return db.project.update({
        where: { id },
        data: data as any,
        include: {
            client: { select: { id: true, name: true } },
        },
    });
}

export async function archiveProject(organizationId: string, id: string) {
    await getProject(organizationId, id);
    return db.project.update({
        where: { id },
        data: { status: "ARCHIVED", archivedAt: new Date() },
    });
}