import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({
    content,
    children,
    className,
}: {
    content: string;
    children: ReactNode;
    className?: string;
}) {
    const [visible, setVisible] = useState(false);
    return (
        <span
            className="relative inline-flex"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <span
                    className={cn(
                        "absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md",
                        className,
                    )}
                >
                    {content}
                </span>
            )}
        </span>
    );
}