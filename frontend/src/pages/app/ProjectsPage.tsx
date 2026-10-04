import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FolderKanban, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { ProjectForm } from "@/features/projects/ProjectForm";
import { useProjects } from "@/features/projects/hooks";
import { formatCurrency, formatDate } from "@/lib/format";

export function ProjectsPage() {
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [priorityFilter, setPriorityFilter] = useState<string>("");
    const [modalOpen, setModalOpen] = useState(false);

    const clientIdFilter = searchParams.get("clientId") ?? undefined;

    const params = useMemo(
        () => ({
            page,
            pageSize: 20,
            q: q || undefined,
            status: (statusFilter || undefined) as any,
            priority: (priorityFilter || undefined) as any,
            clientId: clientIdFilter,
        }),
        [page, q, statusFilter, priorityFilter, clientIdFilter],
    );

    const { data, isLoading } = useProjects(params);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Projects"
                description="Client work, in flight and done."
                actions={
                    <Button onClick={() => setModalOpen(true)}>
                        <Plus className="h-4 w-4" /> New project
                    </Button>
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search projects…"
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                    <option value="">All statuses</option>
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => {
                        setPriorityFilter(e.target.value);
                        setPage(1);
                    }}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                    <option value="">All priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                </select>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-3 p-6">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : !data?.data.length ? (
                        <div className="p-6">
                            <EmptyState
                                icon={<FolderKanban className="h-6 w-6" />}
                                title="No projects yet"
                                description="Create a project to start tracking work."
                                action={
                                    <Button onClick={() => setModalOpen(true)}>
                                        <Plus className="h-4 w-4" /> New project
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project</TableHead>
                                        <TableHead className="hidden md:table-cell">Client</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden sm:table-cell">Priority</TableHead>
                                        <TableHead className="hidden lg:table-cell">Due</TableHead>
                                        <TableHead className="hidden lg:table-cell">Budget</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <Link
                                                    to={`/app/projects/${p.id}`}
                                                    className="font-medium hover:text-primary"
                                                >
                                                    {p.name}
                                                </Link>
                                                {p._count ? (
                                                    <p className="text-xs text-muted-foreground">
                                                        {p._count.tasks} task{p._count.tasks === 1 ? "" : "s"}
                                                    </p>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {p.client?.name ?? "—"}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill status={p.status} />
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <StatusPill status={p.priority} />
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                {formatDate(p.dueDate)}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                {p.budget ? formatCurrency(p.budget) : "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-4">
                                <Pagination
                                    page={data.meta.page}
                                    totalPages={data.meta.totalPages}
                                    onChange={setPage}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="New project"
                description="Attach a project to one of your clients."
            >
                <ProjectForm onDone={() => setModalOpen(false)} />
            </Modal>
        </div>
    );
}
