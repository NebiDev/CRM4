import { cn } from "@/lib/utils";

interface Props {
    src?: string | null;
    name: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

export function Avatar({ src, name, size = "md", className }: Props) {
    const initials = name
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div
            className={cn(
                "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground font-medium",
                sizes[size],
                className,
            )}
        >
            {src ? (
                <img src={src} alt={name} className="h-full w-full object-cover" />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}