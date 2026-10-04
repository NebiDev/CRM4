import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { useProjects } from "@/features/projects/hooks";
import { useCreateTask, useUpdateTask } from "./hooks";
import type { Task } from "./types";

const Schema = z.object({
    projectId: z.string().min(1, "Project is required"),
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED", "ARCHIVED"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    dueDate: z.string().optional().or(z.literal("")),
});

type Values = z.infer<typeof Schema>;

interface Props {
    task?: Task;
    defaultProjectId?: string;
    onDone: () => void;
}

function toDateInput(iso: string | null | undefined): string {
    if (!iso) return "";
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export function TaskForm({ task, defaultProjectId, onDone }: Props) {
    const isEdit = !!task;
    const [submitting, setSubmitting] = useState(false);
    const create = useCreateTask();
    const update = useUpdateTask(task?.id ?? "");
    const { data: projectsData } = useProjects({ pageSize: 100 });

    const form = useForm<Values>({
        resolver: zodResolver(Schema),
        defaultValues: {
            projectId: task?.projectId ?? defaultProjectId ?? "",
            title: task?.title ?? "",
            description: task?.description ?? "",
            status: task?.status ?? "TODO",
            priority: task?.priority ?? "MEDIUM",
            dueDate: toDateInput(task?.dueDate),
        },
    });

    const onSubmit = async (values: Values) => {
        setSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                title: values.title,
                description: values.description || undefined,
                status: values.status,
                priority: values.priority,
            };
            if (values.dueDate) payload.dueDate = values.dueDate;

            if (isEdit) {
                // projectId is immutable server-side
                await update.mutateAsync(payload as Partial<Task>);
            } else {
                payload.projectId = values.projectId;
                await create.mutateAsync(payload as Partial<Task>);
            }
            onDone();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="projectId">Project</Label>
                <select
                    id="projectId"
                    disabled={isEdit}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60"
                    {...form.register("projectId")}
                >
                    <option value="">Select a project…</option>
                    {projectsData?.data.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
                {form.formState.errors.projectId && (
                    <p className="text-xs text-destructive">{form.formState.errors.projectId.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title && (
                    <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                        id="status"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        {...form.register("status")}
                    >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                        id="priority"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        {...form.register("priority")}
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="dueDate">Due date</Label>
                <Input id="dueDate" type="date" {...form.register("dueDate")} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={3} {...form.register("description")} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onDone}>
                    Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? <Spinner /> : isEdit ? "Save changes" : "Create task"}
                </Button>
            </div>
        </form>
    );
}