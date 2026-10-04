import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

const Schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
type Values = z.infer<typeof Schema>;

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<Values>({
        resolver: zodResolver(Schema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (values: Values) => {
        setSubmitting(true);
        try {
            const result = await authClient.signIn.email({
                email: values.email,
                password: values.password,
            });
            if ((result as any).error) {
                throw new Error((result as any).error.message ?? "Sign in failed");
            }
            const from = (location.state as { from?: string })?.from ?? "/app/dashboard";
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Sign in failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md">
                <div className="mb-6 flex flex-col items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <h1 className="text-2xl font-semibold">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">
                        Access your dashboard and manage your business systems.
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input id="email" type="email" placeholder="you@company.com" {...form.register("email")} />
                                {form.formState.errors.email && (
                                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
                                {form.formState.errors.password && (
                                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <Spinner /> : "Sign in"}
                            </Button>
                        </form>

                        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="h-px flex-1 bg-border" />
                            New to NEXA?
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <Link to="/register">
                            <Button variant="outline" className="w-full">Create an account</Button>
                        </Link>
                    </CardContent>
                </Card>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}