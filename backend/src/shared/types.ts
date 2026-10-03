import type { Role } from "./permissions.js";

export interface SessionUser {
    id: string;
    email: string;
    name: string;
}

export interface ActiveMembership {
    id: string;              // Member.id
    organizationId: string;
    role: Role;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: SessionUser;
            membership?: ActiveMembership;
        }
    }
}