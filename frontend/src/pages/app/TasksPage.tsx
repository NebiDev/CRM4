import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckSquare, Plus, Search } from "lucide-react";
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
import { TaskForm } from "@/features/tasks/TaskForm";
import { useTasks } from "@/features/tasks/hooks";
import { formatDate } from "@/lib/format";

export function TasksPage() {
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    const projectIdFilter = searchParams.get("projectId") ?? undefined;

    const params = useMemo(
        () => ({
            page,
            pageSize: 20,
            q: q || undefined,
            status: (statusFilter || undefined) as any,
            priority: (priorityFilter || undefined) as any,
            projectId: projectIdFilter,
        }),
        [page, q, statusFilter, priorityFilter, projectIdFilter],
    );

    const { data, isLoading } = useTasks(params);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Tasks"
                description="What needs doing, across every project."
                actions={
                    <Button onClick={() => setModalOpen(true)}>
                        <Plus className="h-4 w-4" /> New task
                    </Button>
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks…"
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
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="REVIEW">Review</option>
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
                                icon={<CheckSquare className="h-6 w-6" />}
                                title="No tasks yet"
                                description="Add a task to start tracking progress."
                                action={
                                    <Button onClick={() => setModalOpen(true)}>
                                        <Plus className="h-4 w-4" /> New task
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task</TableHead>
                                        <TableHead className="hidden md:table-cell">Project</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden sm:table-cell">Priority</TableHead>
                                        <TableHead className="hidden lg:table-cell">Due</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                <Link
                                                    to={`/app/tasks/${t.id}`}
                                                    className="font-medium hover:text-primary"
                                                >
                                                    {t.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {t.project?.name ?? "—"}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill status={t.status} />
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <StatusPill status={t.priority} />
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                {formatDate(t.dueDate)}
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
                title="New task"
                description="Attach to a project and set a due date."
            >
                <TaskForm
                    defaultProjectId={projectIdFilter}
                    onDone={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}