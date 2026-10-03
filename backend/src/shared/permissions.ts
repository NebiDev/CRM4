// Single source of truth for what each role can do.
// Keep this small and readable. Add capabilities as features land.

export const ROLES = ["owner", "admin", "staff", "client"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
    // Organization / team
    "org.update",
    "org.invite",
    "org.removeMember",
    "org.changeRole",

    // Clients
    "clients.read",
    "clients.create",
    "clients.update",
    "clients.delete",

    // Projects
    "projects.read",
    "projects.create",
    "projects.update",
    "projects.delete",

    // Tasks
    "tasks.read",
    "tasks.create",
    "tasks.update",
    "tasks.delete",

    // Invoices
    "invoices.read",
    "invoices.create",
    "invoices.update",
    "invoices.delete",

    // Files
    "files.read",
    "files.upload",
    "files.delete",

    // Dashboard
    "dashboard.org",
    "dashboard.staff",
    "dashboard.client",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ALL: Permission[] = [...PERMISSIONS];

const STAFF: Permission[] = [
    "clients.read",
    "clients.update",
    "projects.read",
    "projects.create",
    "projects.update",
    "tasks.read",
    "tasks.create",
    "tasks.update",
    "tasks.delete",
    "files.read",
    "files.upload",
    "dashboard.staff",
];

const CLIENT: Permission[] = [
    "clients.read",       // scoped to self via resource check
    "projects.read",      // scoped to linked projects
    "tasks.read",         // scoped to linked projects
    "invoices.read",      // scoped to own invoices
    "files.read",         // scoped to own files
    "dashboard.client",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    owner: ALL,
    admin: ALL,
    staff: STAFF,
    client: CLIENT,
};

export function hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}