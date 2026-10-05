import type { Request, Response } from "express";
import { z } from "zod";
import { buildActor } from "../../middleware/require-org.js";
import { toPaginated } from "../../shared/pagination.js";
import {
    CreateClientSchema,
    ListClientsQuerySchema,
    UpdateClientSchema,
} from "./client.schema.js";
import * as service from "./client.service.js";

export async function list(req: Request, res: Response) {
    const actor = buildActor(req);
    const query = ListClientsQuerySchema.parse(req.query);
    const { rows, total, page, pageSize } = await service.listClients(actor, query);
    res.json(toPaginated(rows, total, page, pageSize));
}

export async function detail(req: Request, res: Response) {
    const actor = buildActor(req);
    const client = await service.getClient(actor, req.params.id!);
    res.json({ data: client });
}

export async function create(req: Request, res: Response) {
    const actor = buildActor(req);
    const input = CreateClientSchema.parse(req.body);
    const client = await service.createClient(actor, input);
    res.status(201).json({ data: client });
}

export async function update(req: Request, res: Response) {
    const actor = buildActor(req);
    const input = UpdateClientSchema.parse(req.body);
    const client = await service.updateClient(actor, req.params.id!, input);
    res.json({ data: client });
}

export async function archive(req: Request, res: Response) {
    const actor = buildActor(req);
    const client = await service.archiveClient(actor, req.params.id!);
    res.json({ data: client });
}