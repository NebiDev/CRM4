
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface Props {
    label: string;
    value: ReactNode;
    hint?: string;
    icon?: ReactNode;
    iconClassName?: string;
    loading?: boolean;
}

export function StatCard({
    label,
    value,
    hint,
    icon,
    iconClassName,
    loading,
}: Props) {
    return (
        <Card>
            <CardContent className="flex min-h-[104px] items-start justify-between gap-4 p-5">
                <div className="min-w-0 space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {label}
                    </p>

                    {loading ? (
                        <Skeleton className="h-8 w-16" />
                    ) : (
                        <p className="text-2xl font-semibold tracking-tight">
                            {value}
                        </p>
                    )}

                    {hint && (
                        <p className="text-xs text-muted-foreground">
                            {hint}
                        </p>
                    )}
                </div>

                {icon && (
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName ?? "bg-muted text-muted-foreground"
                            }`}
                    >
                        {icon}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
