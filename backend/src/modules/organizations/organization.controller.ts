import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";
import { sendEmail } from "../../shared/email.js";
import { invitationEmail } from "../../shared/email-templates.js";
import { env } from "../../config/env.js";

const NotifyInviteSchema = z.object({
    email: z.string().email(),
    role: z.string().min(1),
});

export async function notifyInvitation(req: Request, res: Response) {
    if (!req.user || !req.membership) throw AppError.unauthorized("Not signed in");

    const { email, role } = NotifyInviteSchema.parse(req.body);

    const org = await db.organization.findUnique({
        where: { id: req.membership.organizationId },
        select: { id: true, name: true, slug: true },
    });
    if (!org) throw AppError.notFound("Organization not found");

    // Build an accept link. Better Auth's own handler will validate the token.
    const base = env.FRONTEND_URL.replace(/\/$/, "");
    const acceptUrl = `${base}/accept-invitation?email=${encodeURIComponent(email)}&org=${encodeURIComponent(org.slug ?? org.id)}`;

    const payload = invitationEmail({
        to: email,
        organizationName: org.name,
        inviterName: req.user.name || req.user.email,
        acceptUrl,
        role,
    });

    // Fire-and-forget. The HTTP response returns immediately.
    void sendEmail(payload);

    res.json({ data: { queued: true } });
}