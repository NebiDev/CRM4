import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: Props) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 px-6 text-center",
                className,
            )}
        >
            {icon && <div className="text-muted-foreground">{icon}</div>}
            <h3 className="text-base font-medium">{title}</h3>
            {description && (
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            )}
            {action}
        </div>
    );
}