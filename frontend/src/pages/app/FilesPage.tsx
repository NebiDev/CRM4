import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Files as FilesIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/Table";
import { UploadButton } from "@/features/files/UploadButton";
import { getDownloadUrl, useDeleteFile, useFiles } from "@/features/files/hooks";
import { formatDate } from "@/lib/format";

function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function FilesPage() {
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const remove = useDeleteFile();

    const params = useMemo(
        () => ({
            page, pageSize: 20,
            clientId: searchParams.get("clientId") ?? undefined,
            projectId: searchParams.get("projectId") ?? undefined,
            invoiceId: searchParams.get("invoiceId") ?? undefined,
        }),
        [page, searchParams],
    );

    const { data, isLoading } = useFiles(params);

    const handleDownload = async (id: string) => {
        const url = await getDownloadUrl(id);
        window.open(url, "_blank");
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Files"
                description="Private documents. Downloads use short-lived signed URLs."
                actions={
                    <UploadButton
                        clientId={params.clientId}
                        projectId={params.projectId}
                        invoiceId={params.invoiceId}
                    />
                }
            />

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-3 p-6">
                            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : !data?.data.length ? (
                        <div className="p-6">
                            <EmptyState
                                icon={<FilesIcon className="h-6 w-6" />}
                                title="No files yet"
                                description="Upload agreements, invoices, or project documents."
                                action={
                                    <UploadButton
                                        clientId={params.clientId}
                                        projectId={params.projectId}
                                        invoiceId={params.invoiceId}
                                    />
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="hidden sm:table-cell">Type</TableHead>
                                        <TableHead className="hidden md:table-cell">Size</TableHead>
                                        <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.data.map((f) => (
                                        <TableRow key={f.id}>
                                            <TableCell className="font-medium">{f.originalName}</TableCell>
                                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                {f.contentType}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {formatBytes(f.sizeBytes)}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                {formatDate(f.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDownload(f.id)}>
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setConfirmId(f.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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

            <ConfirmDialog
                open={!!confirmId}
                onClose={() => setConfirmId(null)}
                onConfirm={async () => {
                    if (confirmId) await remove.mutateAsync(confirmId);
                    setConfirmId(null);
                }}
                title="Delete file?"
                description="The file will be removed from S3 and marked deleted in the database."
                confirmLabel="Delete"
                destructive
                loading={remove.isPending}
            />
        </div>
    );
}