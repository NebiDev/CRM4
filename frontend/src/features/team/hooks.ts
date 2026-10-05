import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiPost } from "@/lib/api";

export function useOrganization() {
    return useQuery({
        queryKey: ["organization", "active"],
        queryFn: async () => {
            const result = await authClient.organization.getFullOrganization();
            if ((result as any).error) throw new Error((result as any).error.message);
            return result.data;
        },
    });
}

export function useInviteMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ email, role }: { email: string; role: string }) => {
            const result = await authClient.organization.inviteMember({ email, role });
            if ((result as any).error) throw new Error((result as any).error.message);

            // Non-blocking email notification.
            try {
                await apiPost("/api/organizations/notify-invitation", { email, role });
            } catch (err) {
                console.warn("[invite] notification failed", err);
            }

            return result.data;
        },
        onSuccess: () => {
            toast.success("Invitation sent");
            qc.invalidateQueries({ queryKey: ["organization", "active"] });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useRemoveMember() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (memberIdOrEmail: string) => {
            const result = await authClient.organization.removeMember({
                memberIdOrEmail,
            });
            if ((result as any).error) throw new Error((result as any).error.message);
            return result.data;
        },
        onSuccess: () => {
            toast.success("Member removed");
            qc.invalidateQueries({ queryKey: ["organization", "active"] });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}

export function useUpdateMemberRole() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
            const result = await authClient.organization.updateMemberRole({
                memberId,
                role,
            });
            if ((result as any).error) throw new Error((result as any).error.message);
            return result.data;
        },
        onSuccess: () => {
            toast.success("Role updated");
            qc.invalidateQueries({ queryKey: ["organization", "active"] });
        },
        onError: (e: Error) => toast.error(e.message),
    });
}
export function useActiveMembers() {
    return useQuery({
        queryKey: ["organization", "members"],
        queryFn: async () => {
            const result = await authClient.organization.getFullOrganization();
            if ((result as any).error) throw new Error((result as any).error.message);
            return (result.data?.members ?? []) as Array<{
                id: string;
                role: string;
                user: { id: string; name: string | null; email: string };
            }>;
        },
    });
}