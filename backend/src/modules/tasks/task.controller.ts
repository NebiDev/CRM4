import type { Request, Response } from "express";
import { AppError } from "../../shared/errors.js";
import { toPaginated } from "../../shared/pagination.js";
import {
    CreateTaskSchema,
    ListTasksQuerySchema,
    UpdateTaskSchema,
} from "./task.schema.js";
import * as service from "./task.service.js";

function ctx(req: Request) {
    if (!req.user || !req.membership) throw AppError.unauthorized("Not signed in");
    return { userId: req.user.id, organizationId: req.membership.organizationId };
}

export async function list(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const query = ListTasksQuerySchema.parse(req.query);
    const { rows, total, page, pageSize } = await service.listTasks(organizationId, query);
    res.json(toPaginated(rows, total, page, pageSize));
}

export async function detail(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const task = await service.getTask(organizationId, req.params.id!);
    res.json({ data: task });
}

export async function create(req: Request, res: Response) {
    const { organizationId, userId } = ctx(req);
    const input = CreateTaskSchema.parse(req.body);
    const task = await service.createTask(organizationId, userId, input);
    res.status(201).json({ data: task });
}

export async function update(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const input = UpdateTaskSchema.parse(req.body);
    const task = await service.updateTask(organizationId, req.params.id!, input);
    res.json({ data: task });
}

export async function archive(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const task = await service.archiveTask(organizationId, req.params.id!);
    res.json({ data: task });
}