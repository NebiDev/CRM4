import type { Request, Response } from "express";
import { AppError } from "../../shared/errors.js";
import { toPaginated } from "../../shared/pagination.js";
import {
    CreateProjectSchema,
    ListProjectsQuerySchema,
    UpdateProjectSchema,
} from "./project.schema.js";
import * as service from "./project.service.js";

function ctx(req: Request) {
    if (!req.user || !req.membership) throw AppError.unauthorized("Not signed in");
    return { userId: req.user.id, organizationId: req.membership.organizationId };
}

export async function list(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const query = ListProjectsQuerySchema.parse(req.query);
    const { rows, total, page, pageSize } = await service.listProjects(organizationId, query);
    res.json(toPaginated(rows, total, page, pageSize));
}

export async function detail(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const project = await service.getProject(organizationId, req.params.id!);
    res.json({ data: project });
}

export async function create(req: Request, res: Response) {
    const { organizationId, userId } = ctx(req);
    const input = CreateProjectSchema.parse(req.body);
    const project = await service.createProject(organizationId, userId, input);
    res.status(201).json({ data: project });
}

export async function update(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const input = UpdateProjectSchema.parse(req.body);
    const project = await service.updateProject(organizationId, req.params.id!, input);
    res.json({ data: project });
}

export async function archive(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const project = await service.archiveProject(organizationId, req.params.id!);
    res.json({ data: project });
}