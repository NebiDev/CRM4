import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/Table";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { InvoiceForm } from "@/features/invoices/InvoiceForm";
import { useInvoices } from "@/features/invoices/hooks";
import { formatCurrency, formatDate } from "@/lib/format";

export function InvoicesPage() {
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    const clientIdFilter = searchParams.get("clientId") ?? undefined;

    const params = useMemo(
        () => ({
            page, pageSize: 20, q: q || undefined,
            status: (statusFilter || undefined) as any,
            clientId: clientIdFilter,
        }),
        [page, q, statusFilter, clientIdFilter],
    );

    const { data, isLoading } = useInvoices(params);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Invoices"
                description="Bill clients, track payments, issue PDFs."
                actions={
                    <Button onClick={() => setModalOpen(true)}>
                        <Plus className="h-4 w-4" /> New invoice
                    </Button>
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices…"
                        value={q}
                        onChange={(e) => { setQ(e.target.value); setPage(1); }}
                        className="pl-9"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                    <option value="">All statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="VOID">Void</option>
                </select>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-3 p-6">
                            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : !data?.data.length ? (
                        <div className="p-6">
                            <EmptyState
                                icon={<FileText className="h-6 w-6" />}
                                title="No invoices yet"
                                description="Create your first invoice to get paid."
                                action={
                                    <Button onClick={() => setModalOpen(true)}>
                                        <Plus className="h-4 w-4" /> New invoice
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Number</TableHead>
                                        <TableHead className="hidden md:table-cell">Client</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden sm:table-cell">Due</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell>
                                                <Link to={`/app/invoices/${inv.id}`} className="font-medium hover:text-primary">
                                                    {inv.number}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {inv.client?.name ?? "—"}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill status={inv.status} />
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                {formatDate(inv.dueDate)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(inv.total, inv.currency)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-4">
                                <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="New invoice"
                description="Line items and totals are computed on the server."
            >
                <InvoiceForm onDone={() => setModalOpen(false)} />
            </Modal>
        </div>
    );
}