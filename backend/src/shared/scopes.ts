import type { Prisma } from "@prisma/client";
import { AppError } from "./errors.js";
import type { Actor } from "./types.js";

/**
 * Every scope helper returns a Prisma `where` fragment that MUST be merged
 * with the caller's other filters. Never call these with a raw orgId —
 * always pass the Actor from buildActor().
 *
 * Rules per role:
 *   owner / admin  → everything in the org
 *   staff          → records assigned to them or, for projects, that
 *                    contain tasks assigned to them
 *   client         → records belonging to their single Client row
 */

function requireClientId(actor: Actor): string {
    if (!actor.clientId) {
        throw AppError.forbidden("Client identity not resolved");
    }
    return actor.clientId;
}

export function scopeClients(actor: Actor): Prisma.ClientWhereInput {
    switch (actor.role) {
        case "owner":
        case "admin":
            return { organizationId: actor.organizationId };
        case "staff":
            // Staff can read client records for the org, but not modify them
            // (that's enforced by the permission matrix, not the scope).
            return { organizationId: actor.organizationId };
        case "client":
            return { organizationId: actor.organizationId, id: requireClientId(actor) };
    }
}

export function scopeProjects(actor: Actor): Prisma.ProjectWhereInput {
    switch (actor.role) {
        case "owner":
        case "admin":
            return { organizationId: actor.organizationId };
        case "staff":
            return {
                organizationId: actor.organizationId,
                OR: [
                    { assignedToId: actor.userId },
                    { tasks: { some: { assignedToId: actor.userId } } },
                ],
            };
        case "client":
            return { organizationId: actor.organizationId, clientId: requireClientId(actor) };
    }
}

export function scopeTasks(actor: Actor): Prisma.TaskWhereInput {
    switch (actor.role) {
        case "owner":
        case "admin":
            return { organizationId: actor.organizationId };
        case "staff":
            return { organizationId: actor.organizationId, assignedToId: actor.userId };
        case "client":
            return {
                organizationId: actor.organizationId,
                project: { clientId: requireClientId(actor) },
            };
    }
}

export function scopeInvoices(actor: Actor): Prisma.InvoiceWhereInput {
    switch (actor.role) {
        case "owner":
        case "admin":
            return { organizationId: actor.organizationId };
        case "staff":
            // Staff see invoices for org visibility of the business state,
            // but the permission matrix controls whether they can create/edit.
            return { organizationId: actor.organizationId };
        case "client":
            return { organizationId: actor.organizationId, clientId: requireClientId(actor) };
    }
}

export function scopeFiles(actor: Actor): Prisma.FileAssetWhereInput {
    const base = { deletedAt: null };
    switch (actor.role) {
        case "owner":
        case "admin":
            return { ...base, organizationId: actor.organizationId };
        case "staff":
            return { ...base, organizationId: actor.organizationId };
        case "client":
            return {
                ...base,
                organizationId: actor.organizationId,
                clientId: requireClientId(actor),
                visibility: "CLIENT",
            };
    }
}

export function scopeAgreements(actor: Actor): Prisma.AgreementWhereInput {
    switch (actor.role) {
        case "owner":
        case "admin":
            return { organizationId: actor.organizationId };
        case "staff":
            return { organizationId: actor.organizationId };
        case "client":
            return { organizationId: actor.organizationId, clientId: requireClientId(actor) };
    }
}