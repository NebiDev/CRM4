import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
    warning: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
    danger: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100",
    info: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    tone?: Tone;
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                tones[tone],
                className,
            )}
            {...props}
        />
    );
}