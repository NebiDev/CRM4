import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, FileDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { InvoiceForm } from "@/features/invoices/InvoiceForm";
import {
    useGenerateInvoicePdf,
    useInvoice,
    useTransitionInvoice,
} from "@/features/invoices/hooks";
import { apiGet } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

export function InvoiceDetailPage() {
    const { id } = useParams();
    const { data: invoice, isLoading } = useInvoice(id);
    const transition = useTransitionInvoice(id ?? "");
    const generatePdf = useGenerateInvoicePdf(id ?? "");
    const [editOpen, setEditOpen] = useState(false);

    const downloadPdf = async () => {
        try {
            // The PDF file row is looked up via the files list filtered by invoiceId.
            const filesRes = await apiGet<{ data: { id: string; originalName: string }[] }>(
                "/api/files",
                { invoiceId: id, pageSize: 100 },
            );
            const pdf = filesRes.data.find((f) => f.originalName.endsWith(".pdf"));
            if (!pdf) {
                toast.error("Generate the PDF first");
                return;
            }
            const urlRes = await apiGet<{ data: { url: string } }>(
                `/api/files/${pdf.id}/download-url`,
            );
            window.open(urlRes.data.url, "_blank");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Download failed");
        }
    };

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!invoice) return <p className="text-sm text-muted-foreground">Invoice not found.</p>;

    const allowedNext = {
        DRAFT: ["SENT", "VOID"],
        SENT: ["PAID", "OVERDUE", "VOID"],
        OVERDUE: ["PAID", "VOID"],
        PAID: [],
        VOID: [],
    }[invoice.status] ?? [];

    return (
        <div className="space-y-6">
            <Link to="/app/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to invoices
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{invoice.number}</h1>
                    <div className="mt-1 flex items-center gap-2">
                        <StatusPill status={invoice.status} />
                        {invoice.client && (
                            <Link
                                to={`/app/clients/${invoice.client.id}`}
                                className="text-xs text-muted-foreground hover:text-primary"
                            >
                                {invoice.client.name}
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {invoice.status === "DRAFT" && (
                        <Button variant="outline" onClick={() => setEditOpen(true)}>
                            <Pencil className="h-4 w-4" /> Edit
                        </Button>
                    )}

                    {allowedNext.map((next) => (
                        <Button
                            key={next}
                            variant={next === "VOID" ? "destructive" : "primary"}
                            onClick={() => transition.mutate(next as any)}
                            disabled={transition.isPending}
                        >
                            Mark as {next.toLowerCase()}
                        </Button>
                    ))}

                    {invoice.status !== "DRAFT" && (
                        <>
                            <Button variant="outline" onClick={() => generatePdf.mutate()} disabled={generatePdf.isPending}>
                                <FileDown className="h-4 w-4" /> Generate PDF
                            </Button>
                            <Button variant="outline" onClick={downloadPdf}>
                                <Download className="h-4 w-4" /> Download
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Line items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th className="pb-2 text-left">Description</th>
                                    <th className="pb-2 text-right">Qty</th>
                                    <th className="pb-2 text-right">Unit</th>
                                    <th className="pb-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {invoice.lineItems?.map((li) => (
                                    <tr key={li.id ?? li.position}>
                                        <td className="py-2">{li.description}</td>
                                        <td className="py-2 text-right">{li.quantity}</td>
                                        <td className="py-2 text-right">{formatCurrency(li.unitPrice ?? "0", invoice.currency)}</td>
                                        <td className="py-2 text-right">{formatCurrency(li.amount ?? "0", invoice.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="text-sm">
                                <tr>
                                    <td colSpan={3} className="pt-3 text-right text-muted-foreground">Subtotal</td>
                                    <td className="pt-3 text-right font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="pt-1 text-right text-muted-foreground">Tax</td>
                                    <td className="pt-1 text-right font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="pt-2 text-right text-base">Total</td>
                                    <td className="pt-2 text-right text-base font-semibold">{formatCurrency(invoice.total, invoice.currency)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <Field label="Issued" value={formatDate(invoice.issuedAt)} />
                        <Field label="Due" value={formatDate(invoice.dueDate)} />
                        <Field label="Paid" value={formatDate(invoice.paidAt)} />
                        {invoice.project && (
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Project</p>
                                <Link to={`/app/projects/${invoice.project.id}`} className="hover:text-primary">
                                    {invoice.project.name}
                                </Link>
                            </div>
                        )}
                        {invoice.notes && <Field label="Notes" value={invoice.notes} multiline />}
                    </CardContent>
                </Card>
            </div>

            <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit invoice" className="max-w-3xl">
                <InvoiceForm invoice={invoice} onDone={() => setEditOpen(false)} />
            </Modal>
        </div>
    );
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className={multiline ? "whitespace-pre-wrap" : ""}>{value}</p>
        </div>
    );
}