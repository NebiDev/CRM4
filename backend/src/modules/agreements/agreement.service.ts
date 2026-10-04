import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { assertSameOrg } from "../../shared/tenant.js";
import { logActivity } from "../../shared/activity.js";
import type { CreateAgreementInput } from "./agreement.schema.js";

export async function listAgreements(organizationId: string) {
    return db.agreement.findMany({
        where: { organizationId, archivedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
            client: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
        },
    });
}

export async function getAgreement(organizationId: string, id: string) {
    const a = await db.agreement.findUnique({
        where: { id },
        include: {
            client: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
            file: true,
        },
    });
    assertSameOrg(a, organizationId);
    return a!;
}

export async function createAgreement(
    organizationId: string,
    userId: string,
    input: CreateAgreementInput,
) {
    // Verify file + client + project belong to the org.
    const file = await db.fileAsset.findFirst({
        where: { id: input.fileId, organizationId, deletedAt: null },
    });
    if (!file) throw AppError.badRequest("File not found in this organization");

    const client = await db.client.findFirst({
        where: { id: input.clientId, organizationId },
    });
    if (!client) throw AppError.badRequest("Client not found in this organization");

    if (input.projectId) {
        const project = await db.project.findFirst({
            where: { id: input.projectId, organizationId },
        });
        if (!project) throw AppError.badRequest("Project not found in this organization");
    }

    const agreement = await db.agreement.create({
        data: {
            organizationId,
            clientId: input.clientId,
            projectId: input.projectId,
            fileId: input.fileId,
            title: input.title,
            version: input.version,
            status: input.status,
            notes: input.notes || undefined,
            createdById: userId,
        },
    });

    await logActivity({
        organizationId,
        actorId: userId,
        action: "agreement.created",
        entityType: "Client",
        entityId: agreement.id,
        clientId: agreement.clientId,
        metadata: { title: agreement.title, version: agreement.version },
    });

    return agreement;
}

export async function archiveAgreement(organizationId: string, id: string) {
    await getAgreement(organizationId, id);
    return db.agreement.update({
        where: { id },
        data: { archivedAt: new Date(), status: "VOID" },
    });
}