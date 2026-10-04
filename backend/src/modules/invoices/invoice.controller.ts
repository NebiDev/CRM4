import type { Request, Response } from "express";
import { AppError } from "../../shared/errors.js";
import { toPaginated } from "../../shared/pagination.js";
import {
    CreateInvoiceSchema,
    InvoiceTransitionSchema,
    ListInvoicesQuerySchema,
    UpdateInvoiceSchema,
} from "./invoice.schema.js";
import * as service from "./invoice.service.js";
import { generateAndStoreInvoicePdf } from "./invoice.pdf-service.js";

function ctx(req: Request) {
    if (!req.user || !req.membership) throw AppError.unauthorized("Not signed in");
    return { userId: req.user.id, organizationId: req.membership.organizationId };
}

export async function list(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const query = ListInvoicesQuerySchema.parse(req.query);
    const { rows, total, page, pageSize } = await service.listInvoices(organizationId, query);
    res.json(toPaginated(rows, total, page, pageSize));
}

export async function detail(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const invoice = await service.getInvoice(organizationId, req.params.id!);
    res.json({ data: invoice });
}

export async function create(req: Request, res: Response) {
    const { organizationId, userId } = ctx(req);
    const input = CreateInvoiceSchema.parse(req.body);
    const invoice = await service.createInvoice(organizationId, userId, input);
    res.status(201).json({ data: invoice });
}

export async function update(req: Request, res: Response) {
    const { organizationId, userId } = ctx(req);
    const input = UpdateInvoiceSchema.parse(req.body);
    const invoice = await service.updateInvoice(organizationId, userId, req.params.id!, input);
    res.json({ data: invoice });
}

export async function transition(req: Request, res: Response) {
    const { organizationId, userId } = ctx(req);
    const { status } = InvoiceTransitionSchema.parse(req.body);
    const invoice = await service.transitionInvoice(organizationId, userId, req.params.id!, status);
    res.json({ data: invoice });
}

export async function generatePdf(req: Request, res: Response) {
    const { organizationId, userId } = ctx(req);
    const asset = await generateAndStoreInvoicePdf(organizationId, userId, req.params.id!);
    res.json({ data: asset });
}