import { Navigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/Spinner";

export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
    const { data, isPending } = useSession();

    if (isPending) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner className="h-6 w-6" />
            </div>
        );
    }

    if (data?.user) return <Navigate to="/app/dashboard" replace />;
    return <>{children}</>;
}