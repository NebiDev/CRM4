import type { RequestHandler } from "express";
import { AppError } from "../shared/errors.js";
import { hasPermission, type Permission } from "../shared/permissions.js";

export function authorize(permission: Permission): RequestHandler {
    return (req, _res, next) => {
        if (!req.user) return next(AppError.unauthorized("Not signed in"));
        if (!req.membership) return next(AppError.forbidden("No active organization"));

        if (!hasPermission(req.membership.role, permission)) {
            return next(AppError.forbidden(`Missing permission: ${permission}`));
        }
        next();
    };
}