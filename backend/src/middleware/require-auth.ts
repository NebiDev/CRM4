import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";
import { AppError } from "../shared/errors.js";
import type { ActiveMembership, SessionUser } from "../shared/types.js";
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

        const { db } = await import("../config/db.js");

        const member = activeOrgId
            ? await db.member.findFirst({
                where: { userId: session.user.id, organizationId: activeOrgId },
            })
            : await db.member.findFirst({
                where: { userId: session.user.id },
                orderBy: { createdAt: "asc" },
            });

        if (member) {
            req.membership = {
                id: member.id,
                organizationId: member.organizationId,
                role: member.role as Role,
            };
        }

        next();
    } catch (err) {
        next(err);
    }
};






// export const requireAuth: RequestHandler = async (req, _res, next) => {
//     try {
//         const session = await auth.api.getSession({
//             headers: fromNodeHeaders(req.headers),
//         });

//         if (!session?.user) {
//             throw AppError.unauthorized("Not signed in");
//         }

//         req.user = {
//             id: session.user.id,
//             email: session.user.email,
//             name: session.user.name ?? "",
//         };

//         // Resolve the *active* organization membership for this user.
//         // Better Auth stores the active org id on the session if
//         // the organization plugin's setActive is used. Fall back to
//         // the user's first membership.
//         const activeOrgId = (session.session as { activeOrganizationId?: string })
//             .activeOrganizationId;

//         const membership = activeOrgId
//             ? await auth.api.getActiveMemberRole({
//                 headers: fromNodeHeaders(req.headers),
//             })
//             : null;

//         // We'll query the membership row directly for robustness.
//         const { db } = await import("../config/db.js");
//         const member = activeOrgId
//             ? await db.member.findFirst({
//                 where: { userId: session.user.id, organizationId: activeOrgId },
//             })
//             : await db.member.findFirst({
//                 where: { userId: session.user.id },
//                 orderBy: { createdAt: "asc" },
//             });

//         if (!member) {
//             // Signed in but no org yet — allowed to reach onboarding routes.
//             req.membership = undefined;
//             return next();
//         }

//         req.membership = {
//             id: member.id,
//             organizationId: member.organizationId,
//             role: member.role as Role,
//         } satisfies ActiveMembership;

//         next();
//     } catch (err) {
//         next(err);
//     }
// };