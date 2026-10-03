import type { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../../shared/errors.js";
import * as service from "./dashboard.service.js";

const ActivityQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

function ctx(req: Request) {
    if (!req.user || !req.membership) throw AppError.unauthorized("Not signed in");
    return {
        userId: req.user.id,
        organizationId: req.membership.organizationId,
        role: req.membership.role,
    };
}

export async function summary(req: Request, res: Response) {
    const { organizationId, userId, role } = ctx(req);
    const data = await service.getSummary(organizationId, userId, role);
    res.json({ data });
}

export async function activity(req: Request, res: Response) {
    const { organizationId } = ctx(req);
    const { limit } = ActivityQuerySchema.parse(req.query);
    const data = await service.getRecentActivity(organizationId, limit);
    res.json({ data });
}