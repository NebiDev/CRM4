import { randomUUID } from "node:crypto";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "../../config/db.js";
import { S3_BUCKET, s3 } from "../../config/s3.js";
import { AppError } from "../../shared/errors.js";
import { assertSameOrg } from "../../shared/tenant.js";
import {
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE_BYTES,
    type RequestUploadInput,
} from "./file.schema.js";

const UPLOAD_URL_TTL_SECONDS = 60 * 5;   // 5 minutes
const DOWNLOAD_URL_TTL_SECONDS = 60 * 5; // 5 minutes

async function assertLinkInOrg(
    organizationId: string,
    links: { clientId?: string; projectId?: string; invoiceId?: string },
) {
    if (links.clientId) {
        const c = await db.client.findFirst({
            where: { id: links.clientId, organizationId },
            select: { id: true },
        });
        if (!c) throw AppError.badRequest("Client not found in this organization");
    }
    if (links.projectId) {
        const p = await db.project.findFirst({
            where: { id: links.projectId, organizationId },
            select: { id: true },
        });
        if (!p) throw AppError.badRequest("Project not found in this organization");
    }
    if (links.invoiceId) {
        const i = await db.invoice.findFirst({
            where: { id: links.invoiceId, organizationId },
            select: { id: true },
        });
        if (!i) throw AppError.badRequest("Invoice not found in this organization");
    }
}

function buildObjectKey(organizationId: string, filename: string): string {
    const safeExt = filename.includes(".")
        ? filename.slice(filename.lastIndexOf(".")).toLowerCase().slice(0, 10)
        : "";
    return `org/${organizationId}/${randomUUID()}${safeExt}`;
}

export async function requestUpload(
    organizationId: string,
    userId: string,
    input: RequestUploadInput,
) {
    if (!ALLOWED_MIME_TYPES.includes(input.contentType as any)) {
        throw AppError.badRequest(`Unsupported content type: ${input.contentType}`);
    }
    if (input.sizeBytes > MAX_FILE_SIZE_BYTES) {
        throw AppError.badRequest("File exceeds maximum allowed size");
    }

    await assertLinkInOrg(organizationId, {
        clientId: input.clientId,
        projectId: input.projectId,
        invoiceId: input.invoiceId,
    });

    const bucketKey = buildObjectKey(organizationId, input.filename);

    // Pre-create the FileAsset row in a "pending" state so we have an id
    // to hand back. `checksum` doubles as a status flag: null = pending.
    const file = await db.fileAsset.create({
        data: {
            organizationId,
            uploadedById: userId,
            bucketKey,
            originalName: input.filename,
            contentType: input.contentType,
            sizeBytes: input.sizeBytes,
            visibility: input.visibility,
            clientId: input.clientId,
            projectId: input.projectId,
            invoiceId: input.invoiceId,
        },
    });

    const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: bucketKey,
            ContentType: input.contentType,
            ContentLength: input.sizeBytes,
        }),
        { expiresIn: UPLOAD_URL_TTL_SECONDS },
    );

    return { fileId: file.id, uploadUrl, bucketKey, expiresIn: UPLOAD_URL_TTL_SECONDS };
}

export async function confirmUpload(
    organizationId: string,
    fileId: string,
) {
    const file = await db.fileAsset.findUnique({ where: { id: fileId } });
    assertSameOrg(file, organizationId);

    // Verify the object actually exists in S3.
    try {
        const head = await s3.send(
            new HeadObjectCommand({ Bucket: S3_BUCKET, Key: file!.bucketKey }),
        );
        if (!head.ContentLength || head.ContentLength !== file!.sizeBytes) {
            // Size mismatch — trust S3, update our record.
            await db.fileAsset.update({
                where: { id: fileId },
                data: { sizeBytes: head.ContentLength ?? file!.sizeBytes },
            });
        }
    } catch {
        throw AppError.badRequest("Upload was not completed in S3");
    }

    return db.fileAsset.findUniqueOrThrow({ where: { id: fileId } });
}

export async function listFiles(organizationId: string, query: {
    page: number; pageSize: number;
    clientId?: string; projectId?: string; invoiceId?: string;
}) {
    const { page, pageSize, clientId, projectId, invoiceId } = query;
    const skip = (page - 1) * pageSize;

    const where = {
        organizationId,
        deletedAt: null,
        ...(clientId ? { clientId } : {}),
        ...(projectId ? { projectId } : {}),
        ...(invoiceId ? { invoiceId } : {}),
    };

    const [rows, total] = await Promise.all([
        db.fileAsset.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
        db.fileAsset.count({ where }),
    ]);

    return { rows, total, page, pageSize };
}

export async function getDownloadUrl(organizationId: string, fileId: string) {
    const file = await db.fileAsset.findUnique({ where: { id: fileId } });
    assertSameOrg(file, organizationId);
    if (file!.deletedAt) throw AppError.notFound("File not found");

    const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: file!.bucketKey,
            ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file!.originalName)}"`,
        }),
        { expiresIn: DOWNLOAD_URL_TTL_SECONDS },
    );

    return { url, expiresIn: DOWNLOAD_URL_TTL_SECONDS, file: file! };
}

export async function softDeleteFile(organizationId: string, fileId: string) {
    const file = await db.fileAsset.findUnique({ where: { id: fileId } });
    assertSameOrg(file, organizationId);

    // Best-effort S3 delete — if it fails, we still mark deleted in DB.
    try {
        await s3.send(
            new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: file!.bucketKey }),
        );
    } catch (err) {
        console.warn("[files] S3 delete failed, marking DB only", err);
    }

    return db.fileAsset.update({
        where: { id: fileId },
        data: { deletedAt: new Date() },
    });
}