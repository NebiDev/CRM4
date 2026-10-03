import { Prisma } from "@prisma/client";
import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { assertSameOrg } from "../../shared/tenant.js";
import type {
    CreateTaskInput,
    ListTasksQuery,
    UpdateTaskInput,
} from "./task.schema.js";

function clean<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== "") out[k] = v;
    }
    return out;
}

async function assertProjectInOrg(organizationId: string, projectId: string) {
    const project = await db.project.findFirst({
        where: { id: projectId, organizationId },
        select: { id: true },
    });
    if (!project) throw AppError.badRequest("Project does not exist in this organization");
}

async function assertAssigneeInOrg(organizationId: string, userId: string) {
    const member = await db.member.findFirst({
        where: { userId, organizationId },
        select: { id: true },
    });
    if (!member) throw AppError.badRequest("Assignee is not a member of this organization");
}

export async function listTasks(organizationId: string, query: ListTasksQuery) {
    const { page, pageSize, q, status, priority, projectId, assignedToId, sort, order } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.TaskWhereInput = {
        organizationId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(projectId ? { projectId } : {}),
        ...(assignedToId ? { assignedToId } : {}),
        ...(q
            ? {
                OR: [
                    { title: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                ],
            }
            : {}),
    };

    const [rows, total] = await Promise.all([
        db.task.findMany({
            where,
            orderBy: { [sort]: order },
            skip,
            take: pageSize,
            include: {
                project: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, name: true } },
            },
        }),
        db.task.count({ where }),
    ]);

    return { rows, total, page, pageSize };
}

export async function getTask(organizationId: string, id: string) {
    const task = await db.task.findUnique({
        where: { id },
        include: {
            project: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
        },
    });
    assertSameOrg(task, organizationId);
    return task!;
}

export async function createTask(
    organizationId: string,
    userId: string,
    input: CreateTaskInput,
) {
    await assertProjectInOrg(organizationId, input.projectId);
    if (input.assignedToId) {
        await assertAssigneeInOrg(organizationId, input.assignedToId);
    }

    const data = clean(input);
    return db.task.create({
        data: {
            ...(data as any),
            organizationId,
            createdById: userId,
        },
        include: {
            project: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
        },
    });
}

export async function updateTask(
    organizationId: string,
    id: string,
    input: UpdateTaskInput,
) {
    const existing = await getTask(organizationId, id);

    if (input.assignedToId) {
        await assertAssigneeInOrg(organizationId, input.assignedToId);
    }

    // Guard against skipping back out of terminal states
    if (existing.status === "COMPLETED" && input.status && input.status !== "COMPLETED") {
        throw AppError.badRequest("Cannot reopen a completed task");
    }
    if (existing.status === "ARCHIVED") {
        throw AppError.badRequest("Cannot modify an archived task");
    }

    const data = clean(input);
    return db.task.update({
        where: { id },
        data: data as any,
        include: {
            project: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
        },
    });
}

export async function archiveTask(organizationId: string, id: string) {
    await getTask(organizationId, id);
    return db.task.update({
        where: { id },
        data: { status: "ARCHIVED", archivedAt: new Date() },
    });
}