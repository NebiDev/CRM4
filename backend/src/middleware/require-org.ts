import type { RequestHandler } from "express";
import { AppError } from "../shared/errors.js";

export const requireOrg: RequestHandler = (req, _res, next) => {
    if (!req.user) throw AppError.unauthorized("Not signed in");
    if (!req.membership) {
        throw AppError.forbidden("No active organization for this user");
    }
    next();
};