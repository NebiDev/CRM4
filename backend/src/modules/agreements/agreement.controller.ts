import type { Request, Response } from "express";
import { AppError } from "../../shared/errors.js";
import { CreateAgreementSchema } from "./agreement.schema.js";
import * as service from "./agreement.service.js";

function ctx(req: Request) {
    if (!req.user || !req.membership) throw AppError.unauthorized("Not signed in");
    return { userId: req.user.id, organizationId: req.membership.organizationId };
}

export async function list(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    res.json({ data: await service.listAgreements(organizationId) });
}

export async function detail(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    res.json({ data: await service.getAgreement(organizationId, req.params.id!) });
}

export async function create(req: Request, res: Response) {
    const { organizationId, userId } = ctx(req);
    const input = CreateAgreementSchema.parse(req.body);
    const a = await service.createAgreement(organizationId, userId, input);
    res.status(201).json({ data: a });
}

export async function archive(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    res.json({ data: await service.archiveAgreement(organizationId, req.params.id!) });
}