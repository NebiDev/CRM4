import { Badge } from "@/components/ui/Badge";

const tones: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    // Clients
    ACTIVE: "success",
    INACTIVE: "warning",
    ARCHIVED: "default",
    // Projects
    PLANNING: "info",
    ON_HOLD: "warning",
    COMPLETED: "success",
    // Tasks
    TODO: "default",
    IN_PROGRESS: "info",
    REVIEW: "warning",
    // Invoices
    DRAFT: "default",
    SENT: "info",
    PAID: "success",
    OVERDUE: "danger",
    VOID: "default",
};

export function StatusPill({ status }: { status: string }) {
    const tone = tones[status] ?? "default";
    return <Badge tone={tone}>{status.replace(/_/g, " ")}</Badge>;
}