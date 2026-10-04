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
import { useProjects } from "@/features/projects/hooks";
import { LineItemsEditor } from "./LineItemsEditor";
import { useCreateInvoice, useUpdateInvoice } from "./hooks";
import type { Invoice, InvoiceLineItem } from "./types";

const Schema = z.object({
    clientId: z.string().min(1, "Client is required"),
    projectId: z.string().optional().or(z.literal("")),
    currency: z.string().length(3).default("USD"),
    taxRate: z.coerce.number().min(0).max(1).default(0),
    dueDate: z.string().optional().or(z.literal("")),
    notes: z.string().max(5000).optional().or(z.literal("")),
});
type Values = z.infer<typeof Schema>;

interface Props {
    invoice?: Invoice;
    onDone: () => void;
}

function toDateInput(iso: string | null | undefined) {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function InvoiceForm({ invoice, onDone }: Props) {
    const isEdit = !!invoice;
    const [submitting, setSubmitting] = useState(false);
    const create = useCreateInvoice();
    const update = useUpdateInvoice(invoice?.id ?? "");
    const { data: clientsData } = useClients({ pageSize: 100 });

    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
        invoice?.lineItems?.map((li) => ({
            description: li.description,
            quantity: Number(li.quantity),
            unitPrice: Number(li.unitPrice),
            position: li.position,
        })) ?? [{ description: "", quantity: 1, unitPrice: 0, position: 0 }],
    );

    const form = useForm<Values>({
        resolver: zodResolver(Schema),
        defaultValues: {
            clientId: invoice?.clientId ?? "",
            projectId: invoice?.projectId ?? "",
            currency: invoice?.currency ?? "USD",
            taxRate: invoice
                ? Number(invoice.subtotal) > 0
                    ? Number(invoice.taxAmount) / Number(invoice.subtotal)
                    : 0
                : 0,
            dueDate: toDateInput(invoice?.dueDate),
            notes: invoice?.notes ?? "",
        },
    });

    const watchedClientId = form.watch("clientId");
    const { data: projectsData } = useProjects({
        pageSize: 100,
        clientId: watchedClientId || undefined,
    });

    const onSubmit = async (values: Values) => {
        const validItems = lineItems.filter((li) => li.description.trim().length > 0);
        if (validItems.length === 0) {
            return;
        }

        setSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                taxRate: values.taxRate,
                lineItems: validItems.map((li, idx) => ({
                    description: li.description,
                    quantity: Number(li.quantity),
                    unitPrice: Number(li.unitPrice),
                    position: idx,
                })),
            };
            if (values.dueDate) payload.dueDate = values.dueDate;
            if (values.notes) payload.notes = values.notes;

            if (isEdit) {
                await update.mutateAsync(payload as any);
            } else {
                payload.clientId = values.clientId;
                payload.currency = values.currency;
                if (values.projectId) payload.projectId = values.projectId;
                await create.mutateAsync(payload as any);
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
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="projectId">Project (optional)</Label>
                    <select
                        id="projectId"
                        disabled={isEdit || !watchedClientId}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60"
                        {...form.register("projectId")}
                    >
                        <option value="">None</option>
                        {projectsData?.data.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                        id="currency"
                        maxLength={3}
                        disabled={isEdit}
                        {...form.register("currency")}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax rate (0–1)</Label>
                    <Input
                        id="taxRate"
                        type="number"
                        step="0.0001"
                        min="0"
                        max="1"
                        {...form.register("taxRate")}
                    />
                    <p className="text-xs text-muted-foreground">
                        e.g. 0.075 for 7.5%
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due date</Label>
                    <Input id="dueDate" type="date" {...form.register("dueDate")} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Line items</Label>
                <LineItemsEditor items={lineItems} onChange={setLineItems} disabled={isEdit && invoice?.status !== "DRAFT"} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={3} {...form.register("notes")} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? <Spinner /> : isEdit ? "Save changes" : "Create invoice"}
                </Button>
            </div>
        </form>
    );
}