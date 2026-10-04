import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateClient, useUpdateClient } from "./hooks";
import type { Client } from "./types";

const Schema = z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    company: z.string().trim().max(200).optional().or(z.literal("")),
    status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
    notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

type Values = z.infer<typeof Schema>;

interface Props {
    client?: Client;
    onDone: () => void;
}

export function ClientForm({ client, onDone }: Props) {
    const isEdit = !!client;
    const [submitting, setSubmitting] = useState(false);
    const create = useCreateClient();
    const update = useUpdateClient(client?.id ?? "");

    const form = useForm<Values>({
        resolver: zodResolver(Schema),
        defaultValues: {
            name: client?.name ?? "",
            email: client?.email ?? "",
            phone: client?.phone ?? "",
            company: client?.company ?? "",
            status: client?.status ?? "ACTIVE",
            notes: client?.notes ?? "",
        },
    });

    const onSubmit = async (values: Values) => {
        setSubmitting(true);
        try {
            if (isEdit) await update.mutateAsync(values);
            else await create.mutateAsync(values);
            onDone();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...form.register("email")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...form.register("phone")} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...form.register("company")} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    {...form.register("status")}
                >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} {...form.register("notes")} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onDone}>
                    Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? <Spinner /> : isEdit ? "Save changes" : "Create client"}
                </Button>
            </div>
        </form>
    );
}