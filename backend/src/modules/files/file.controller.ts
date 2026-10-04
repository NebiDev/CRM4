import type { Request, Response } from "express";
import { AppError } from "../../shared/errors.js";
import { toPaginated } from "../../shared/pagination.js";
import {
    ConfirmUploadSchema,
    ListFilesQuerySchema,
    RequestUploadSchema,
} from "./file.schema.js";
import * as service from "./file.service.js";

function ctx(req: Request) {
    if (!req.user || !req.membership) throw AppError.unauthorized("Not signed in");
    return { userId: req.user.id, organizationId: req.membership.organizationId };
}

export async function requestUpload(req: Request, res: Response) {
    const { organizationId, userId } = ctx(req);
    const input = RequestUploadSchema.parse(req.body);
    const data = await service.requestUpload(organizationId, userId, input);
    res.status(201).json({ data });
}

export async function confirmUpload(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const { fileId } = ConfirmUploadSchema.parse(req.body);
    const data = await service.confirmUpload(organizationId, fileId);
    res.json({ data });
}

export async function list(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const query = ListFilesQuerySchema.parse(req.query);
    const { rows, total, page, pageSize } = await service.listFiles(organizationId, query);
    res.json(toPaginated(rows, total, page, pageSize));
}

export async function download(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const data = await service.getDownloadUrl(organizationId, req.params.id!);
    res.json({ data });
}

export async function remove(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const data = await service.softDeleteFile(organizationId, req.params.id!);
    res.json({ data });
}