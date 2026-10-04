import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Activity } from "lucide-react";
import { formatRelative } from "@/lib/format";
import type { ActivityEntry } from "@/lib/types";

interface Props {
    entries?: ActivityEntry[];
    loading?: boolean;
}

function describe(entry: ActivityEntry): string {
    const actor = entry.actor?.name ?? "Someone";
    const [entity, verb] = entry.action.split(".");
    return `${actor} ${verb ?? "updated"}d ${entity ?? "item"}`;
}

export function ActivityFeed({ entries, loading }: Props) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-3 w-2/3" />
                            <Skeleton className="h-3 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!entries || entries.length === 0) {
        return (
            <EmptyState
                icon={<Activity className="h-6 w-6" />}
                title="No recent activity"
                description="Events will appear here as your team works."
            />
        );
    }

    return (
        <ul className="space-y-4">
            {entries.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {(entry.actor?.name ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{describe(entry)}</p>
                        <p className="text-xs text-muted-foreground">{formatRelative(entry.createdAt)}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}