import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users } from "lucide-react";
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
import { ClientForm } from "@/features/clients/ClientForm";
import { useClients } from "@/features/clients/hooks";
import { formatDate } from "@/lib/format";

export function ClientsPage() {
    const [page, setPage] = useState(1);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [modalOpen, setModalOpen] = useState(false);

    const params = useMemo(
        () => ({
            page,
            pageSize: 20,
            q: q || undefined,
            status: (statusFilter || undefined) as any,
        }),
        [page, q, statusFilter],
    );

    const { data, isLoading } = useClients(params);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Clients"
                description="Every client relationship in your organization."
                actions={
                    <Button onClick={() => setModalOpen(true)}>
                        <Plus className="h-4 w-4" /> New client
                    </Button>
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search clients…"
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
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
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
                                icon={<Users className="h-6 w-6" />}
                                title="No clients yet"
                                description="Add your first client to get started."
                                action={
                                    <Button onClick={() => setModalOpen(true)}>
                                        <Plus className="h-4 w-4" /> New client
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="hidden md:table-cell">Company</TableHead>
                                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden lg:table-cell">Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell>
                                                <Link
                                                    to={`/app/clients/${c.id}`}
                                                    className="font-medium hover:text-primary"
                                                >
                                                    {c.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {c.company ?? "—"}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                {c.email ?? "—"}
                                            </TableCell>
                                            <TableCell>
                                                <StatusPill status={c.status} />
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                {formatDate(c.createdAt)}
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
                title="New client"
                description="Add a client to your organization."
            >
                <ClientForm onDone={() => setModalOpen(false)} />
            </Modal>
        </div>
    );
}