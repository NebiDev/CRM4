import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "../../config/db.js";
import { S3_BUCKET, s3 } from "../../config/s3.js";
import { AppError } from "../../shared/errors.js";
import { renderInvoicePdf } from "./invoice.pdf.js";
import { getInvoice } from "./invoice.service.js";
import { logActivity } from "../../shared/activity.js";

const ORG_NAME_FALLBACK = "NEXA";

export async function generateAndStoreInvoicePdf(
    organizationId: string,
    userId: string,
    invoiceId: string,
) {
    const invoice = await getInvoice(organizationId, invoiceId);

    // Only generate PDFs for issued invoices (SENT/PAID/OVERDUE). Draft is editable.
    if (invoice.status === "DRAFT") {
        throw AppError.badRequest("Issue the invoice before generating its PDF");
    }

    const org = await db.organization.findUnique({
        where: { id: organizationId },
        select: { name: true },
    });

    const pdf = await renderInvoicePdf({
        invoice: invoice as any,
        organizationName: org?.name ?? ORG_NAME_FALLBACK,
    });

    const key = `org/${organizationId}/invoices/${invoice.id}/${invoice.number}.pdf`;

    await s3.send(
        new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: pdf,
            ContentType: "application/pdf",
        }),
    );

    // Upsert a FileAsset row so it shows in the standard file list.
    const existing = await db.fileAsset.findFirst({
        where: { organizationId, invoiceId: invoice.id, bucketKey: key },
    });

    const asset = existing ?? await db.fileAsset.create({
        data: {
            organizationId,
            invoiceId: invoice.id,
            clientId: invoice.clientId,
            projectId: invoice.projectId,
            uploadedById: userId,
            bucketKey: key,
            originalName: `${invoice.number}.pdf`,
            contentType: "application/pdf",
            sizeBytes: pdf.length,
            visibility: "CLIENT",
        },
    });

    await logActivity({
        organizationId,
        actorId: userId,
        action: "invoice.pdf_generated",
        entityType: "Invoice",
        entityId: invoice.id,
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        metadata: { key },
    });

    return asset;
}