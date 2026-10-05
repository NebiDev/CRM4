import { Link, type LinkProps } from "react-router-dom";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

export interface LinkButtonProps extends Omit<LinkProps, "className"> {
    variant?: Variant;
    size?: Size;
    className?: string;
    children: ReactNode;
}

const variants: Record<Variant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
    icon: "h-10 w-10",
};

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => (
        <Link
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    ),
);
LinkButton.displayName = "LinkButton";