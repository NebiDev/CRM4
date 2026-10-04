import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface Props {
    label: string;
    value: ReactNode;
    hint?: string;
    icon?: ReactNode;
    loading?: boolean;
}

export function StatCard({ label, value, hint, icon, loading }: Props) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>
                    {loading ? (
                        <Skeleton className="h-8 w-16" />
                    ) : (
                        <p className="text-2xl font-semibold">{value}</p>
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