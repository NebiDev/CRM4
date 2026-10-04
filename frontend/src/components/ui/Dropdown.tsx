import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
    trigger: ReactNode;
    children: ReactNode;
    align?: "left" | "right";
    className?: string;
}

export function Dropdown({ trigger, children, align = "right", className }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative inline-block">
            <button type="button" onClick={() => setOpen((v) => !v)}>
                {trigger}
            </button>
            {open && (
                <div
                    className={cn(
                        "absolute z-50 mt-2 min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-md",
                        align === "right" ? "right-0" : "left-0",
                        className,
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

export function DropdownItem({
    className,
    onClick,
    children,
}: {
    className?: string;
    onClick?: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                className,
            )}
        >
            {children}
        </button>
    );
}