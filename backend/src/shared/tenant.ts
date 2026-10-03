import { AppError } from "./errors.js";

/**
 * Ensures a loaded resource belongs to the caller's active organization.
 * Returns 404 (not 403) to avoid leaking cross-tenant existence.
 */
export function assertSameOrg(
    resource: { organizationId: string } | null | undefined,
    orgId: string,
): void {
    if (!resource) throw AppError.notFound("Resource not found");
    if (resource.organizationId !== orgId) {
        throw AppError.notFound("Resource not found");
    }
}