import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: Props) {
    useEffect(() => {
        if (!open) return;
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onEsc);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onEsc);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    "w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg animate-slide-up",
                    className,
                )}
            >
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        {title && <h2 className="text-lg font-semibold">{title}</h2>}
                        {description && (
                            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 hover:bg-accent"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}