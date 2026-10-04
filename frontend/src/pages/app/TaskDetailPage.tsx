import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { TaskForm } from "@/features/tasks/TaskForm";
import { useArchiveTask, useTask } from "@/features/tasks/hooks";
import { formatDate } from "@/lib/format";

export function TaskDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: task, isLoading } = useTask(id);
    const archive = useArchiveTask();
    const [editOpen, setEditOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleArchive = async () => {
        if (!id) return;
        await archive.mutateAsync(id);
        setConfirmOpen(false);
        navigate("/app/tasks");
    };

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!task) return <p className="text-sm text-muted-foreground">Task not found.</p>;

    return (
        <div className="space-y-6">
            <Link to="/app/tasks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to tasks
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{task.title}</h1>
                    <div className="mt-1 flex items-center gap-2">
                        <StatusPill status={task.status} />
                        <StatusPill status={task.priority} />
                        {task.project && (
                            <Link
                                to={`/app/projects/${task.project.id}`}
                                className="text-xs text-muted-foreground hover:text-primary"
                            >
                                {task.project.name}
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditOpen(true)}>
                        <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                        <Trash2 className="h-4 w-4" /> Archive
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Description
                            </p>
                            <p className="whitespace-pre-wrap">{task.description || "—"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Due
                                </p>
                                <p>{formatDate(task.dueDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Assigned to
                                </p>
                                <p>{task.assignedTo?.name ?? "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Created
                                </p>
                                <p>{formatDate(task.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Updated
                                </p>
                                <p>{formatDate(task.updatedAt)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Related</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {task.project && (
                            <Link className="block hover:text-primary" to={`/app/projects/${task.project.id}`}>
                                → Project
                            </Link>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit task">
                <TaskForm task={task} onDone={() => setEditOpen(false)} />
            </Modal>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleArchive}
                title="Archive task?"
                description="Archived tasks remain readable but drop out of active filters."
                confirmLabel="Archive"
                destructive
                loading={archive.isPending}
            />
        </div>
    );
}