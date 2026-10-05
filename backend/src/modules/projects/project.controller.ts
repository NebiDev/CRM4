import type { Request, Response } from "express";
import { buildActor } from "../../middleware/require-org.js";
import { toPaginated } from "../../shared/pagination.js";
import {
    CreateProjectSchema,
    ListProjectsQuerySchema,
    UpdateProjectSchema,
} from "./project.schema.js";
import * as service from "./project.service.js";

export async function list(req: Request, res: Response) {
    const actor = buildActor(req);
    const query = ListProjectsQuerySchema.parse(req.query);
    const { rows, total, page, pageSize } = await service.listProjects(actor, query);
    res.json(toPaginated(rows, total, page, pageSize));
}

export async function detail(req: Request, res: Response) {
    const actor = buildActor(req);
    const project = await service.getProject(actor, req.params.id!);
    res.json({ data: project });
}

export async function create(req: Request, res: Response) {
    const actor = buildActor(req);
    const input = CreateProjectSchema.parse(req.body);
    const project = await service.createProject(actor, input);
    res.status(201).json({ data: project });
}

export async function update(req: Request, res: Response) {
    const actor = buildActor(req);
    const input = UpdateProjectSchema.parse(req.body);
    const project = await service.updateProject(actor, req.params.id!, input);
    res.json({ data: project });
}

export async function archive(req: Request, res: Response) {
    const actor = buildActor(req);
    const project = await service.archiveProject(actor, req.params.id!);
    res.json({ data: project });
}