import type { RequestHandler } from "express";
import { AppError } from "../shared/errors.js";
import type { Actor } from "../shared/types.js";

/**
 * Requires that the request is associated with an organization — either
 * as a member or as a client-portal user.
 */
export const requireOrg: RequestHandler = (req, _res, next) => {
    if (!req.user) throw AppError.unauthorized("Not signed in");
    if (!req.membership && !req.client) {
        throw AppError.forbidden("No active organization for this user");
    }
    next();
};

/**
 * Builds the Actor used by services for scoping. Throws if the request
 * has neither an org membership nor a client identity.
 *
 * Usage in controllers:
 *   const actor = buildActor(req);
 */
export function buildActor(req: { user?: { id: string }; membership?: { organizationId: string; role: string }; client?: { id: string; organizationId: string } }): Actor {
    if (!req.user) throw AppError.unauthorized("Not signed in");

    // A member with role "client" is a portal user.
    if (req.membership?.role === "client" && req.client) {
        return {
            userId: req.user.id,
            organizationId: req.client.organizationId,
            role: "client",
            clientId: req.client.id,
        };
    }

    if (req.membership) {
        return {
            userId: req.user.id,
            organizationId: req.membership.organizationId,
            role: req.membership.role as Actor["role"],
        };
    }

    // A pure portal user with no membership at all.
    if (req.client) {
        return {
            userId: req.user.id,
            organizationId: req.client.organizationId,
            role: "client",
            clientId: req.client.id,
        };
    }

    throw AppError.forbidden("No active organization for this user");
}