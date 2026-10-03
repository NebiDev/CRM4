import type { Request, Response } from "express";
import { AppError } from "../../shared/errors.js";
import { toPaginated } from "../../shared/pagination.js";
import {
    CreateClientSchema,
    ListClientsQuerySchema,
    UpdateClientSchema,
} from "./client.schema.js";
import * as service from "./client.service.js";

function ctx(req: Request) {
    if (!req.user || !req.membership) {
        throw AppError.unauthorized("Not signed in");
    }
    return {
        userId: req.user.id,
        organizationId: req.membership.organizationId,
    };
}

export async function list(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const query = ListClientsQuerySchema.parse(req.query);
    const { rows, total, page, pageSize } = await service.listClients(
        organizationId,
        query,
    );
    res.json(toPaginated(rows, total, page, pageSize));
}

export async function detail(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const client = await service.getClient(organizationId, req.params.id!);
    res.json({ data: client });
}

export async function create(req: Request, res: Response) {
    const { organizationId, userId } = ctx(req);
    const input = CreateClientSchema.parse(req.body);
    const client = await service.createClient(organizationId, userId, input);
    res.status(201).json({ data: client });
}

export async function update(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const input = UpdateClientSchema.parse(req.body);
    const client = await service.updateClient(organizationId, req.params.id!, input);
    res.json({ data: client });
}

export async function archive(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const client = await service.archiveClient(organizationId, req.params.id!);
    res.json({ data: client });
}