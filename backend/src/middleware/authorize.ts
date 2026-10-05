

import type { RequestHandler } from "express";
import { AppError } from "../shared/errors.js";
import { hasPermission, Role, ROLE_PERMISSIONS, type Permission } from "../shared/permissions.js";

export function authorize(permission: Permission): RequestHandler {
    return (req, _res, next) => {
        if (!req.user) return next(AppError.unauthorized("Not signed in"));

        // Portal-client identity only wins when the membership says so.
        const role: Role | undefined =
            req.membership?.role === "client"
                ? "client"
                : req.membership?.role ?? (req.client ? "client" : undefined);

        if (!role) return next(AppError.forbidden("No active organization for this user"));

        if (!hasPermission(role, permission)) {
            return next(AppError.forbidden(`Missing permission: ${permission}`));
        }
        next();
    };
}







