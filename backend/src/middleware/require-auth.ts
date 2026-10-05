import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";
import { db } from "../config/db.js";
import { AppError } from "../shared/errors.js";
import type { Role } from "../shared/permissions.js";

export const requireAuth: RequestHandler = async (req, _res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session?.user) throw AppError.unauthorized("Not signed in");

        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name ?? "",
        };

        const activeOrgId = (session.session as { activeOrganizationId?: string })
            .activeOrganizationId;

        // Resolve membership FIRST — this is the source of truth for "who am I in this org".
        const member = activeOrgId
            ? await db.member.findFirst({
                where: { userId: session.user.id, organizationId: activeOrgId },
            })
            : await db.member.findFirst({
                where: { userId: session.user.id },
                orderBy: { createdAt: "asc" },
            });

        if (!member) {
            // Not a member of any org. Could still be a portal client (next check).
            const client = await db.client.findFirst({
                where: { userId: session.user.id },
                select: { id: true, organizationId: true },
            });
            if (client) {
                req.client = { id: client.id, organizationId: client.organizationId };
            }
            return next();
        }

        req.membership = {
            id: member.id,
            organizationId: member.organizationId,
            role: member.role as Role,
        };

        // If their role in this org is literally "client", resolve the Client row.
        // Otherwise they are staff/admin/owner and req.client stays undefined.
        if (member.role === "client") {
            const client = await db.client.findFirst({
                where: {
                    userId: session.user.id,
                    organizationId: member.organizationId,
                },
                select: { id: true },
            });
            if (client) {
                req.client = { id: client.id, organizationId: member.organizationId };
            }
        }

        next();
    } catch (err) {
        next(err);
    }
};