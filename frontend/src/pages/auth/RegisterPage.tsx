import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { LinkButton } from "@/components/ui/LinkButton";

const Schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email(),
    company: z.string().optional(),
    password: z
        .string()
        .min(8, "At least 8 characters")
        .regex(/[A-Z]/, "At least one uppercase letter")
        .regex(/[a-z]/, "At least one lowercase letter")
        .regex(/[0-9]/, "At least one number"),
});
type Values = z.infer<typeof Schema>;

export function RegisterPage() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<Values>({
        resolver: zodResolver(Schema),
        defaultValues: { name: "", email: "", company: "", password: "" },
    });

    const onSubmit = async (values: Values) => {
        setSubmitting(true);
        try {
            const result = await authClient.signUp.email({
                email: values.email,
                password: values.password,
                name: values.name,
            });
            if ((result as any).error) {
                throw new Error((result as any).error.message ?? "Sign up failed");
            }
            toast.success("Account created");
            navigate("/app/dashboard", { replace: true });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Sign up failed");
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
                    <h1 className="text-2xl font-semibold">Create your account</h1>
                    <p className="text-sm text-muted-foreground">
                        Start modernizing your business operations today.
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full name</Label>
                                    <Input id="name" placeholder="John Smith" {...form.register("name")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company (optional)</Label>
                                    <Input id="company" placeholder="Your Company" {...form.register("company")} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input id="email" type="email" placeholder="you@company.com" {...form.register("email")} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters, including uppercase, lowercase letters, and numbers.
                                </p>
                                {form.formState.errors.password && (
                                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <Spinner /> : "Create account"}
                            </Button>
                        </form>

                        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="h-px flex-1 bg-border" />
                            Already have an account?
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <LinkButton to="/login" variant="outline" className="w-full">
                            Sign in instead
                        </LinkButton>
                        <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
                            <p className="font-medium">Why register?</p>
                            <ul className="mt-2 space-y-1 text-muted-foreground">
                                <li>→ Access to your client dashboard</li>
                                <li>→ Track project progress in real time</li>
                                <li>→ Receive invoices and documents directly</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}