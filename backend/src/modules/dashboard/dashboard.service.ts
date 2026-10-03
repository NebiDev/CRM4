import { db } from "../../config/db.js";
import type { Role } from "../../shared/permissions.js";

export interface SummaryCard {
    label: string;
    value: number | string;
    hint?: string;
}

export interface DashboardSummary {
    role: Role;
    cards: SummaryCard[];
    charts: {
        projectsByStatus: Array<{ status: string; count: number }>;
        tasksByStatus: Array<{ status: string; count: number }>;
        revenueByMonth: Array<{ month: string; total: string }>;
    };
    recent: {
        projects: Array<{ id: string; name: string; status: string; updatedAt: Date }>;
        tasks: Array<{ id: string; title: string; status: string; updatedAt: Date }>;
    };
}

export async function getSummary(
    organizationId: string,
    userId: string,
    role: Role,
): Promise<DashboardSummary> {
    // ── Scoping rules ──────────────────────────────────────
    // ADMIN/OWNER: whole org
    // STAFF: tasks assigned to them, projects they're on (project membership = via tasks)
    // CLIENT: their own linked records — not implemented yet (Phase 12).
    //         For now, client role gets empty/zeroed cards.
    const isAdmin = role === "owner" || role === "admin";
    const isStaff = role === "staff";

    if (role === "client") {
        return {
            role,
            cards: [
                { label: "Your projects", value: 0 },
                { label: "Open invoices", value: 0 },
                { label: "Documents", value: 0 },
            ],
            charts: { projectsByStatus: [], tasksByStatus: [], revenueByMonth: [] },
            recent: { projects: [], tasks: [] },
        };
    }

    const clientWhere = { organizationId };
    const projectWhere = isAdmin
        ? { organizationId }
        : { organizationId, tasks: { some: { assignedToId: userId } } };
    const taskWhere = isAdmin
        ? { organizationId }
        : { organizationId, assignedToId: userId };

    const [
        clientCount,
        activeProjectCount,
        openTaskCount,
        overdueTaskCount,
        projectsByStatusRaw,
        tasksByStatusRaw,
        recentProjects,
        recentTasks,
    ] = await Promise.all([
        db.client.count({ where: clientWhere }),
        db.project.count({ where: { ...projectWhere, status: "ACTIVE" } }),
        db.task.count({
            where: { ...taskWhere, status: { in: ["TODO", "IN_PROGRESS", "REVIEW"] } },
        }),
        db.task.count({
            where: {
                ...taskWhere,
                status: { in: ["TODO", "IN_PROGRESS", "REVIEW"] },
                dueDate: { lt: new Date() },
            },
        }),
        db.project.groupBy({
            by: ["status"],
            where: projectWhere,
            _count: { _all: true },
        }),
        db.task.groupBy({
            by: ["status"],
            where: taskWhere,
            _count: { _all: true },
        }),
        db.project.findMany({
            where: projectWhere,
            orderBy: { updatedAt: "desc" },
            take: 5,
            select: { id: true, name: true, status: true, updatedAt: true },
        }),
        db.task.findMany({
            where: taskWhere,
            orderBy: { updatedAt: "desc" },
            take: 5,
            select: { id: true, title: true, status: true, updatedAt: true },
        }),
    ]);

    // Revenue: sum invoices per month (PAID only), last 6 months. Admin only.
    const revenueByMonth: Array<{ month: string; total: string }> = [];
    if (isAdmin) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const invoices = await db.invoice.findMany({
            where: {
                organizationId,
                status: "PAID",
                paidAt: { gte: sixMonthsAgo },
            },
            select: { total: true, paidAt: true, currency: true },
        });

        const buckets = new Map<string, number>();
        for (const inv of invoices) {
            if (!inv.paidAt) continue;
            const key = `${inv.paidAt.getFullYear()}-${String(inv.paidAt.getMonth() + 1).padStart(2, "0")}`;
            buckets.set(key, (buckets.get(key) ?? 0) + Number(inv.total));
        }

        for (const [month, total] of [...buckets.entries()].sort()) {
            revenueByMonth.push({ month, total: total.toFixed(2) });
        }
    }

    const cards: SummaryCard[] = isAdmin
        ? [
            { label: "Clients", value: clientCount },
            { label: "Active projects", value: activeProjectCount },
            { label: "Open tasks", value: openTaskCount },
            { label: "Overdue tasks", value: overdueTaskCount, hint: "needs attention" },
        ]
        : [
            { label: "Active projects", value: activeProjectCount },
            { label: "Open tasks", value: openTaskCount },
            { label: "Overdue tasks", value: overdueTaskCount },
        ];

    return {
        role,
        cards,
        charts: {
            projectsByStatus: projectsByStatusRaw.map((r) => ({
                status: r.status,
                count: r._count._all,
            })),
            tasksByStatus: tasksByStatusRaw.map((r) => ({
                status: r.status,
                count: r._count._all,
            })),
            revenueByMonth,
        },
        recent: {
            projects: recentProjects,
            tasks: recentTasks,
        },
    };
}

export async function getRecentActivity(organizationId: string, limit = 20) {
    return db.activityLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 100),
        include: {
            actor: { select: { id: true, name: true, email: true } },
        },
    });
}