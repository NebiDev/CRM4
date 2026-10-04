import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { ProjectForm } from "@/features/projects/ProjectForm";
import { useArchiveProject, useProject } from "@/features/projects/hooks";
import { useTasks } from "@/features/tasks/hooks";
import { formatCurrency, formatDate } from "@/lib/format";

export function ProjectDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: project, isLoading } = useProject(id);
    const archive = useArchiveProject();
    const [editOpen, setEditOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { data: tasks } = useTasks({ projectId: id, pageSize: 50 });

    const handleArchive = async () => {
        if (!id) return;
        await archive.mutateAsync(id);
        setConfirmOpen(false);
        navigate("/app/projects");
    };

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!project) return <p className="text-sm text-muted-foreground">Project not found.</p>;

    return (
        <div className="space-y-6">
            <Link to="/app/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to projects
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{project.name}</h1>
                    <div className="mt-1 flex items-center gap-2">
                        <StatusPill status={project.status} />
                        <StatusPill status={project.priority} />
                        {project.client && (
                            <Link
                                to={`/app/clients/${project.client.id}`}
                                className="text-xs text-muted-foreground hover:text-primary"
                            >
                                {project.client.name}
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
                        <Field label="Description" value={project.description} multiline />
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Start" value={formatDate(project.startDate)} />
                            <Field label="Due" value={formatDate(project.dueDate)} />
                            <Field label="Budget" value={project.budget ? formatCurrency(project.budget) : "—"} />
                            <Field label="Updated" value={formatDate(project.updatedAt)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Related</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <Link className="block hover:text-primary" to={`/app/tasks?projectId=${project.id}`}>
                            → Tasks {tasks ? `(${tasks.meta.total})` : ""}
                        </Link>
                        <Link className="block hover:text-primary" to={`/app/invoices?projectId=${project.id}`}>
                            → Invoices
                        </Link>
                        <Link className="block hover:text-primary" to={`/app/files?projectId=${project.id}`}>
                            → Files
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    {tasks?.data.length ? (
                        <ul className="divide-y divide-border">
                            {tasks.data.map((t) => (
                                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                                    <Link to={`/app/tasks/${t.id}`} className="truncate text-sm hover:text-primary">
                                        {t.title}
                                    </Link>
                                    <StatusPill status={t.status} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No tasks yet.</p>
                    )}
                </CardContent>
            </Card>

            <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project">
                <ProjectForm project={project} onDone={() => setEditOpen(false)} />
            </Modal>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleArchive}
                title="Archive project?"
                description="Tasks remain, but the project stops appearing in active filters."
                confirmLabel="Archive"
                destructive
                loading={archive.isPending}
            />
        </div>
    );
}

function Field({
    label,
    value,
    multiline,
}: {
    label: string;
    value: string | null | undefined;
    multiline?: boolean;
}) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className={multiline ? "whitespace-pre-wrap" : ""}>{value || "—"}</p>
        </div>
    );
}