import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/features/dashboard/StatusPill";
import { ClientForm } from "@/features/clients/ClientForm";
import { useArchiveClient, useClient } from "@/features/clients/hooks";
import { formatDate } from "@/lib/format";

export function ClientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: client, isLoading } = useClient(id);
    const archive = useArchiveClient();
    const [editOpen, setEditOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleArchive = async () => {
        if (!id) return;
        await archive.mutateAsync(id);
        setConfirmOpen(false);
        navigate("/app/clients");
    };

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (!client) {
        return <p className="text-sm text-muted-foreground">Client not found.</p>;
    }

    return (
        <div className="space-y-6">
            <Link to="/app/clients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to clients
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{client.name}</h1>
                    <div className="mt-1 flex items-center gap-2">
                        <StatusPill status={client.status} />
                        <span className="text-xs text-muted-foreground">
                            Added {formatDate(client.createdAt)}
                        </span>
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
                        <Field label="Email" value={client.email} />
                        <Field label="Phone" value={client.phone} />
                        <Field label="Company" value={client.company} />
                        <Field label="Notes" value={client.notes} multiline />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Related</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <Link className="block hover:text-primary" to={`/app/projects?clientId=${client.id}`}>
                            → Projects
                        </Link>
                        <Link className="block hover:text-primary" to={`/app/invoices?clientId=${client.id}`}>
                            → Invoices
                        </Link>
                        <Link className="block hover:text-primary" to={`/app/files?clientId=${client.id}`}>
                            → Files
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit client">
                <ClientForm client={client} onDone={() => setEditOpen(false)} />
            </Modal>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleArchive}
                title="Archive client?"
                description="Archived clients remain readable but stop appearing in filters."
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