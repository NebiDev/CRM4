import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as RTooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    AlertCircle,
    CheckSquare,
   
    Users,
} from "lucide-react";

import {
    UsersRound,
    FolderKanban,
    ListChecks,
    CircleAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/features/dashboard/StatCard";
import { ActivityFeed } from "@/features/dashboard/ActivityFeed";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { useActivity, useDashboardSummary } from "@/features/dashboard/hooks";
import { formatRelative } from "@/lib/format";
import { Link } from "react-router-dom";

const PROJECT_COLORS: Record<string, string> = {
    PLANNING: "#60a5fa",
    ACTIVE: "#2563eb",
    ON_HOLD: "#f59e0b",
    COMPLETED: "#10b981",
    ARCHIVED: "#94a3b8",
};

export function DashboardPage() {
    const { data: summary, isLoading: loadingSummary } = useDashboardSummary();
    const { data: activity, isLoading: loadingActivity } = useActivity(8);

    const isClient = summary?.role === "client";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    {isClient ? "Your workspace" : "Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {isClient
                        ? "Projects, invoices, and documents shared with you."
                        : "Live snapshot of your business."}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {loadingSummary
                    ? [0, 1, 2, 3].map((i) => (
                        <StatCard key={i} label="—" value="—" loading />
                    ))
                    : summary?.cards.map((card, i) => (

                        <StatCard
                            key={i}
                            label={card.label}
                            value={card.value}
                            hint={card.hint}
                            icon={
                                i === 0 ? (
                                    <UsersRound className="h-5 w-5" strokeWidth={1.8} />
                                ) : i === 1 ? (
                                    <FolderKanban className="h-5 w-5" strokeWidth={1.8} />
                                ) : i === 2 ? (
                                    <ListChecks className="h-5 w-5" strokeWidth={1.8} />
                                ) : (
                                    <CircleAlert className="h-5 w-5" strokeWidth={1.8} />
                                )
                            }
                            iconClassName={
                                i === 0
                                    ? "bg-blue-50 text-blue-600"
                                    : i === 1
                                        ? "bg-violet-50 text-violet-600"
                                        : i === 2
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-rose-50 text-rose-600"
                            }
                        />

                    ))}
            </div>

            {/* Charts + activity */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Projects by status */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Projects by status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        {summary?.charts.projectsByStatus?.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summary.charts.projectsByStatus}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <RTooltip />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {summary.charts.projectsByStatus.map((entry) => (
                                            <Cell key={entry.status} fill={PROJECT_COLORS[entry.status] ?? "#2563eb"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                No project data yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ActivityFeed entries={activity} loading={loadingActivity} />
                    </CardContent>
                </Card>
            </div>

            {/* Revenue chart (admin only) */}
            {summary?.charts.revenueByMonth?.length ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue (last 6 months, paid invoices)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={summary.charts.revenueByMonth.map((r) => ({
                                    month: r.month,
                                    total: Number(r.total),
                                }))}
                            >
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <RTooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            ) : null}

            {/* Recent items */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summary?.recent.projects?.length ? (
                            <ul className="divide-y divide-border">
                                {summary.recent.projects.map((p) => (
                                    <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                                        <div className="min-w-0">
                                            <Link to={`/app/projects/${p.id}`} className="truncate text-sm font-medium hover:text-primary">
                                                {p.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                Updated {formatRelative(p.updatedAt)}
                                            </p>
                                        </div>
                                        <StatusPill status={p.status} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No projects yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summary?.recent.tasks?.length ? (
                            <ul className="divide-y divide-border">
                                {summary.recent.tasks.map((t) => (
                                    <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                                        <div className="min-w-0">
                                            <Link to={`/app/tasks/${t.id}`} className="truncate text-sm font-medium hover:text-primary">
                                                {t.title}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                Updated {formatRelative(t.updatedAt)}
                                            </p>
                                        </div>
                                        <StatusPill status={t.status} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No tasks yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}