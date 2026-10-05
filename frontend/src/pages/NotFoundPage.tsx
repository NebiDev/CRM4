import { LinkButton } from "@/components/ui/LinkButton";

export function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-semibold">404</h1>
            <p className="text-muted-foreground">That page doesn't exist.</p>
            <LinkButton to="/">Go home</LinkButton>
        </div>
    );
}