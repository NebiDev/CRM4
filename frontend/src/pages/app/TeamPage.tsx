import { useState } from "react";
import { Mail, Trash2, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/Table";
import {
    useInviteMember,
    useOrganization,
    useRemoveMember,
    useUpdateMemberRole,
} from "@/features/team/hooks";

const InviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(["admin", "staff", "client"]),
});
type InviteValues = z.infer<typeof InviteSchema>;

export function TeamPage() {
    const { data: org, isLoading } = useOrganization();
    const invite = useInviteMember();
    const remove = useRemoveMember();
    const updateRole = useUpdateMemberRole();
    const [inviteOpen, setInviteOpen] = useState(false);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const form = useForm<InviteValues>({
        resolver: zodResolver(InviteSchema),
        defaultValues: { email: "", role: "staff" },
    });

    const onInvite = async (values: InviteValues) => {
        await invite.mutateAsync(values);
        setInviteOpen(false);
        form.reset();
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Team"
                description="Members of your organization and their roles."
                actions={
                    <Button onClick={() => setInviteOpen(true)}>
                        <UserPlus className="h-4 w-4" /> Invite member
                    </Button>
                }
            />

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="space-y-3 p-6">
                            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {org?.members?.map((m: any) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="font-medium">
                                            {m.user?.name ?? "—"}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">
                                            {m.user?.email}
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                value={m.role}
                                                onChange={(e) =>
                                                    updateRole.mutate({ memberId: m.id, role: e.target.value })
                                                }
                                                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                            >
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                                <option value="staff">Staff</option>
                                                <option value="client">Client</option>
                                            </select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setConfirmId(m.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {org?.invitations?.length ? (
                <Card>
                    <CardContent className="p-6">
                        <h2 className="mb-3 text-sm font-semibold">Pending invitations</h2>
                        <ul className="space-y-2">
                            {org.invitations.map((inv: any) => (
                                <li key={inv.id} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        {inv.email}
                                    </span>
                                    <Badge tone="info">{inv.role}</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            ) : null}

            <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite member">
                <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...form.register("email")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            {...form.register("role")}
                        >
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="client">Client</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={invite.isPending}>
                            Send invitation
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                open={!!confirmId}
                onClose={() => setConfirmId(null)}
                onConfirm={async () => {
                    if (confirmId) await remove.mutateAsync(confirmId);
                    setConfirmId(null);
                }}
                title="Remove member?"
                description="They lose access immediately. Their past activity remains."
                confirmLabel="Remove"
                destructive
            />
        </div>
    );
}