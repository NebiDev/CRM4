import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Tab {
    value: string;
    label: string;
    content: ReactNode;
}

interface Props {
    value: string;
    onChange: (v: string) => void;
    tabs: Tab[];
    className?: string;
}

export function Tabs({ value, onChange, tabs, className }: Props) {
    const active = tabs.find((t) => t.value === value);
    return (
        <div className={className}>
            <div className="inline-flex items-center rounded-md bg-muted p-1">
                {tabs.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => onChange(t.value)}
                        className={cn(
                            "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                            value === t.value
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="mt-4">{active?.content}</div>
        </div>
    );
}