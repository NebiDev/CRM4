import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface Props {
    label: string;
    value: ReactNode;
    hint?: string;
    icon?: ReactNode;
    loading?: boolean;
    tone?: "default" | "primary" | "warning" | "danger";
}

const toneRing: Record<NonNullable<Props["tone"]>, string> = {
    default: "",
    primary: "ring-1 ring-primary/20",
    warning: "ring-1 ring-amber-500/20",
    danger: "ring-1 ring-rose-500/20",
};

export function StatCard({ label, value, hint, icon, loading, tone = "default" }: Props) {
    return (
        <Card className={cn("overflow-hidden", toneRing[tone])}>
            <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0 space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {label}
                    </p>
                    {loading ? (
                        <Skeleton className="h-8 w-20" />
                    ) : (
                        <p className="truncate text-2xl font-semibold tracking-tight">{value}</p>
                    )}
                    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                </div>
                {icon && (
                    <div className="rounded-md bg-muted p-2 text-muted-foreground">{icon}</div>
                )}
            </CardContent>
        </Card>
    );
}