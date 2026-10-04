import { Prisma } from "@prisma/client";
import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { assertSameOrg } from "../../shared/tenant.js";
import { logActivity } from "../../shared/activity.js";
import type {
    CreateInvoiceInput,
    ListInvoicesQuery,
    UpdateInvoiceInput,
} from "./invoice.schema.js";

// ── Helpers ────────────────────────────────────────────────

async function nextInvoiceNumber(tx: any, organizationId: string): Promise<string> {
    // Use a simple per-org counter row pattern via MAX.
    // Fine for MVP scale; replace with a dedicated sequence table if you
    // ever need concurrent issue throughput beyond a few per second.
    const last = await tx.invoice.findFirst({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        select: { number: true },
    });

    const year = new Date().getFullYear();
    let seq = 1;

    if (last?.number) {
        const m = /^INV-(\d{4})-(\d{5})$/.exec(last.number);
        if (m && Number(m[1]) === year) {
            seq = Number(m[2]) + 1;
        }
    }

    return `INV-${year}-${String(seq).padStart(5, "0")}`;
}

async function assertClientInOrg(organizationId: string, clientId: string) {
    const c = await db.client.findFirst({
        where: { id: clientId, organizationId },
        select: { id: true },
    });
    if (!c) throw AppError.badRequest("Client not found in this organization");
}

async function assertProjectInOrg(organizationId: string, projectId: string) {
    const p = await db.project.findFirst({
        where: { id: projectId, organizationId },
        select: { id: true },
    });
    if (!p) throw AppError.badRequest("Project not found in this organization");
}

function computeTotals(
    lineItems: Array<{ quantity: number; unitPrice: number; position: number; description: string }>,
    taxRate: number,
) {
    const lineAmounts = lineItems.map((li) => {
        const amount = Number((li.quantity * li.unitPrice).toFixed(2));
        return { ...li, amount };
    });
    const subtotal = lineAmounts.reduce((s, li) => s + li.amount, 0);
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));
    return { lineAmounts, subtotal, taxAmount, total };
}

// ── Read ───────────────────────────────────────────────────

export async function listInvoices(organizationId: string, query: ListInvoicesQuery) {
    const { page, pageSize, q, status, clientId, projectId, sort, order } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.InvoiceWhereInput = {
        organizationId,
        ...(status ? { status } : {}),
        ...(clientId ? { clientId } : {}),
        ...(projectId ? { projectId } : {}),
        ...(q
            ? {
                OR: [
                    { number: { contains: q, mode: "insensitive" } },
                    { notes: { contains: q, mode: "insensitive" } },
                    { client: { name: { contains: q, mode: "insensitive" } } },
                ],
            }
            : {}),
    };

    const [rows, total] = await Promise.all([
        db.invoice.findMany({
            where,
            orderBy: { [sort]: order },
            skip,
            take: pageSize,
            include: {
                client: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
                _count: { select: { lineItems: true } },
            },
        }),
        db.invoice.count({ where }),
    ]);

    return { rows, total, page, pageSize };
}

export async function getInvoice(organizationId: string, id: string) {
    const invoice = await db.invoice.findUnique({
        where: { id },
        include: {
            client: { select: { id: true, name: true, email: true, company: true } },
            project: { select: { id: true, name: true } },
            lineItems: { orderBy: { position: "asc" } },
            files: { where: { deletedAt: null } },
        },
    });
    assertSameOrg(invoice, organizationId);
    return invoice!;
}

// ── Create ─────────────────────────────────────────────────

export async function createInvoice(
    organizationId: string,
    userId: string,
    input: CreateInvoiceInput,
) {
    await assertClientInOrg(organizationId, input.clientId);
    if (input.projectId) {
        await assertProjectInOrg(organizationId, input.projectId);
    }

    const { lineAmounts, subtotal, taxAmount, total } = computeTotals(
        input.lineItems,
        input.taxRate,
    );

    const invoice = await db.$transaction(async (tx) => {
        const number = await nextInvoiceNumber(tx, organizationId);

        return tx.invoice.create({
            data: {
                organizationId,
                clientId: input.clientId,
                projectId: input.projectId,
                number,
                status: "DRAFT",
                currency: input.currency,
                subtotal: new Prisma.Decimal(subtotal),
                taxAmount: new Prisma.Decimal(taxAmount),
                total: new Prisma.Decimal(total),
                dueDate: input.dueDate,
                notes: input.notes || undefined,
                createdById: userId,
                lineItems: {
                    create: lineAmounts.map((li, idx) => ({
                        description: li.description,
                        quantity: new Prisma.Decimal(li.quantity),
                        unitPrice: new Prisma.Decimal(li.unitPrice),
                        amount: new Prisma.Decimal(li.amount),
                        position: li.position ?? idx,
                    })),
                },
            },
            include: {
                client: { select: { id: true, name: true } },
                lineItems: { orderBy: { position: "asc" } },
            },
        });
    });

    await logActivity({
        organizationId,
        actorId: userId,
        action: "invoice.created",
        entityType: "Invoice",
        entityId: invoice.id,
        clientId: invoice.clientId,
        invoiceId: invoice.id,
        metadata: { number: invoice.number, total: invoice.total.toString() },
    });

    return invoice;
}

// ── Update (draft only) ────────────────────────────────────

export async function updateInvoice(
    organizationId: string,
    userId: string,
    id: string,
    input: UpdateInvoiceInput,
) {
    const existing = await getInvoice(organizationId, id);
    if (existing.status !== "DRAFT") {
        throw AppError.badRequest("Only draft invoices can be edited");
    }

    let totals: { lineAmounts: any[]; subtotal: number; taxAmount: number; total: number } | null = null;
    if (input.lineItems) {
        const taxRate = input.taxRate ?? Number(existing.taxAmount) / Number(existing.subtotal || 1);
        totals = computeTotals(input.lineItems, taxRate);
    }

    return db.$transaction(async (tx) => {
        if (totals && input.lineItems) {
            await tx.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
        }

        return tx.invoice.update({
            where: { id },
            data: {
                ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
                ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
                ...(totals
                    ? {
                        subtotal: new Prisma.Decimal(totals.subtotal),
                        taxAmount: new Prisma.Decimal(totals.taxAmount),
                        total: new Prisma.Decimal(totals.total),
                        lineItems: {
                            create: totals.lineAmounts.map((li, idx) => ({
                                description: li.description,
                                quantity: new Prisma.Decimal(li.quantity),
                                unitPrice: new Prisma.Decimal(li.unitPrice),
                                amount: new Prisma.Decimal(li.amount),
                                position: li.position ?? idx,
                            })),
                        },
                    }
                    : {}),
            },
            include: {
                client: { select: { id: true, name: true } },
                lineItems: { orderBy: { position: "asc" } },
            },
        });
    });
}

// ── Status transitions ─────────────────────────────────────

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ["SENT", "VOID"],
    SENT: ["PAID", "OVERDUE", "VOID"],
    OVERDUE: ["PAID", "VOID"],
    PAID: [],
    VOID: [],
};

export async function transitionInvoice(
    organizationId: string,
    userId: string,
    id: string,
    next: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID",
) {
    const existing = await getInvoice(organizationId, id);

    const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(next)) {
        throw AppError.badRequest(`Cannot transition invoice from ${existing.status} to ${next}`);
    }

    const update: Prisma.InvoiceUpdateInput = { status: next };
    if (next === "SENT" && !existing.issuedAt) {
        update.issuedAt = new Date();
    }
    if (next === "PAID") {
        update.paidAt = new Date();
    }

    const invoice = await db.invoice.update({ where: { id }, data: update });

    await logActivity({
        organizationId,
        actorId: userId,
        action: `invoice.${next.toLowerCase()}`,
        entityType: "Invoice",
        entityId: id,
        clientId: invoice.clientId,
        invoiceId: id,
        metadata: { number: invoice.number, total: invoice.total.toString() },
    });

    return invoice;
}