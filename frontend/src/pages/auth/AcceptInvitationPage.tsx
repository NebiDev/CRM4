import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export function AcceptInvitationPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [state, setState] = useState<"checking" | "need-auth" | "accepted" | "error">("checking");

    const email = params.get("email") ?? "";
    const orgSlug = params.get("org") ?? "";

    useEffect(() => {
        (async () => {
            const session = await authClient.getSession();
            if (!session.data?.user) {
                setState("need-auth");
                return;
            }

            try {
                const result = await authClient.organization.acceptInvitation({
                    invitationId: params.get("id") ?? "",
                });
                if ((result as any).error) throw new Error((result as any).error.message);
                setState("accepted");
                toast.success("Invitation accepted");
                setTimeout(() => navigate("/app/dashboard", { replace: true }), 800);
            } catch (err) {
                console.error(err);
                setState("error");
            }
        })();
    }, [navigate, params]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Sparkles className="h-5 w-5" />
                    </div>

                    {state === "checking" && (
                        <>
                            <Spinner className="h-5 w-5" />
                            <p className="text-sm text-muted-foreground">Checking your invitation…</p>
                        </>
                    )}

                    {state === "need-auth" && (
                        <>
                            <h1 className="text-lg font-semibold">Sign in to accept</h1>
                            <p className="text-sm text-muted-foreground">
                                You've been invited to join {orgSlug || "an organization"} as {email || "a member"}.
                            </p>
                            <Button onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}>
                                Sign in
                            </Button>
                        </>
                    )}

                    {state === "accepted" && (
                        <>
                            <h1 className="text-lg font-semibold">Welcome aboard</h1>
                            <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
                        </>
                    )}

                    {state === "error" && (
                        <>
                            <h1 className="text-lg font-semibold">Couldn't accept this invitation</h1>
                            <p className="text-sm text-muted-foreground">
                                It may have expired or already been used. Ask an admin to send a new one.
                            </p>
                            <Button variant="outline" onClick={() => navigate("/")}>Go home</Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}