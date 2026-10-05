import type { Role } from "./permissions.js";

/**
 * The authenticated user, as resolved from the Better Auth session.
 * This is intentionally minimal — it describes a person, not a role.
 */
export interface SessionUser {
    id: string;
    email: string;
    name: string;
}

/**
 * A user's membership in an organization. Present on the request when
 * the user is a Member row (owner / admin / staff). Never present for
 * a client-portal user.
 */
export interface ActiveMembership {
    id: string;              // Member.id
    organizationId: string;
    role: Role;              // owner | admin | staff  (client is not a member role anymore)
}

/**
 * The client-portal identity of the signed-in user, resolved from
 * Client.userId. Present on the request only when the user is linked
 * to a Client record. Never present for staff/admin/owner.
 */
export interface RequestClient {
    id: string;              // Client.id
    organizationId: string;
}

/**
 * Actor = the single argument all scope helpers need.
 * Exactly one of `membership` / `client` is meaningful, decided by `kind`.
 */
export interface Actor {
    userId: string;
    organizationId: string;
    role: Role;
    /** Set only when role === "client" */
    clientId?: string;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: SessionUser;
            membership?: ActiveMembership;
            client?: RequestClient;
        }
    }
}