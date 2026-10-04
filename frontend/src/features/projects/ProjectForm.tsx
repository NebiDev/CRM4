import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { useClients } from "@/features/clients/hooks";
import {
    useCreateProject,
    useUpdateProject,
} from "./hooks";
import type { Project } from "./types";

const Schema = z.object({
    clientId: z.string().min(1, "Client is required"),
    name: z.string().trim().min(1, "Name is required").max(200),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    startDate: z.string().optional().or(z.literal("")),
    dueDate: z.string().optional().or(z.literal("")),
    budget: z.string().optional().or(z.literal("")),
});

type Values = z.infer<typeof Schema>;

interface Props {
    project?: Project;
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

export function ProjectForm({ project, onDone }: Props) {
    const isEdit = !!project;
    const [submitting, setSubmitting] = useState(false);
    const create = useCreateProject();
    const update = useUpdateProject(project?.id ?? "");
    const { data: clientsData } = useClients({ pageSize: 100 });

    const form = useForm<Values>({
        resolver: zodResolver(Schema),
        defaultValues: {
            clientId: project?.clientId ?? "",
            name: project?.name ?? "",
            description: project?.description ?? "",
            status: project?.status ?? "PLANNING",
            priority: project?.priority ?? "MEDIUM",
            startDate: toDateInput(project?.startDate),
            dueDate: toDateInput(project?.dueDate),
            budget: project?.budget ?? "",
        },
    });

    const onSubmit = async (values: Values) => {
        setSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                clientId: values.clientId,
                name: values.name,
                description: values.description || undefined,
                status: values.status,
                priority: values.priority,
            };
            if (values.startDate) payload.startDate = values.startDate;
            if (values.dueDate) payload.dueDate = values.dueDate;
            if (values.budget) payload.budget = values.budget;

            if (isEdit) {
                // clientId is immutable server-side; drop it from the payload
                delete payload.clientId;
                await update.mutateAsync(payload as Partial<Project>);
            } else {
                await create.mutateAsync(payload as Partial<Project>);
            }
            onDone();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <select
                    id="clientId"
                    disabled={isEdit}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60"
                    {...form.register("clientId")}
                >
                    <option value="">Select a client…</option>
                    {clientsData?.data.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {form.formState.errors.clientId && (
                    <p className="text-xs text-destructive">{form.formState.errors.clientId.message}</p>
                )}
                {isEdit && (
                    <p className="text-xs text-muted-foreground">
                        Client cannot be changed after creation.
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
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
                        <option value="PLANNING">Planning</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ON_HOLD">On hold</option>
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start date</Label>
                    <Input id="startDate" type="date" {...form.register("startDate")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due date</Label>
                    <Input id="dueDate" type="date" {...form.register("dueDate")} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input id="budget" placeholder="0.00" inputMode="decimal" {...form.register("budget")} />
                <p className="text-xs text-muted-foreground">
                    Stored as a decimal. Use a string like <code>12500.00</code>.
                </p>
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
                    {submitting ? <Spinner /> : isEdit ? "Save changes" : "Create project"}
                </Button>
            </div>
        </form>
    );
}