import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs } from "@/components/ui/Tabs";
import { Spinner } from "@/components/ui/Spinner";
import { authClient, useSession } from "@/lib/auth-client";
import { useOrganization } from "@/features/team/hooks";
import { useTheme } from "@/app/theme";
import { cn } from "@/lib/utils";

export function SettingsPage() {
    const [tab, setTab] = useState("profile");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage your account, organization, and preferences.
                </p>
            </div>

            <Tabs
                value={tab}
                onChange={setTab}
                tabs={[
                    { value: "profile", label: "Profile", content: <ProfileTab /> },
                    { value: "org", label: "Organization", content: <OrganizationTab /> },
                    { value: "appearance", label: "Appearance", content: <AppearanceTab /> },
                ]}
            />
        </div>
    );
}

/* ─────────────────────────────────────────── */

const ProfileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
});
type ProfileValues = z.infer<typeof ProfileSchema>;

function ProfileTab() {
    const { data } = useSession();
    const [saving, setSaving] = useState(false);

    const form = useForm<ProfileValues>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: { name: data?.user?.name ?? "" },
    });

    const onSubmit = async (values: ProfileValues) => {
        setSaving(true);
        try {
            // Better Auth exposes updateUser; if your version differs, check
            // node_modules/better-auth/dist/client/*.d.ts for the exact name.
            const result = await (authClient as any).updateUser({ name: values.name });
            if (result?.error) throw new Error(result.error.message);
            toast.success("Profile updated");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>How you appear to your team.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={data?.user?.email ?? ""} disabled />
                        <p className="text-xs text-muted-foreground">
                            Email changes are not supported yet.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input id="name" {...form.register("name")} />
                        {form.formState.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="pt-2">
                        <Button type="submit" disabled={saving}>
                            {saving ? <Spinner /> : "Save changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────── */

const OrgSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(50)
        .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and dashes only"),
});
type OrgValues = z.infer<typeof OrgSchema>;

function OrganizationTab() {
    const { data: org } = useOrganization();
    const [saving, setSaving] = useState(false);

    const form = useForm<OrgValues>({
        resolver: zodResolver(OrgSchema),
        values: {
            name: (org as any)?.name ?? "",
            slug: (org as any)?.slug ?? "",
        },
    });

    const onSubmit = async (values: OrgValues) => {
        setSaving(true);
        try {
            const result = await (authClient.organization as any).update({
                data: { name: values.name, slug: values.slug },
            });
            if (result?.error) throw new Error(result.error.message);
            toast.success("Organization updated");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update organization");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                    Details shown to your team and on documents.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="org-name">Name</Label>
                        <Input id="org-name" {...form.register("name")} />
                        {form.formState.errors.name && (
                            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="org-slug">Slug</Label>
                        <Input id="org-slug" {...form.register("slug")} />
                        {form.formState.errors.slug && (
                            <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
                        )}
                    </div>
                    <div className="pt-2">
                        <Button type="submit" disabled={saving}>
                            {saving ? <Spinner /> : "Save changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────── */

function AppearanceTab() {
    const { theme, setTheme } = useTheme();
    const options = [
        { value: "light" as const, label: "Light", icon: Sun },
        { value: "dark" as const, label: "Dark", icon: Moon },
        { value: "system" as const, label: "System", icon: Monitor },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Choose how NEXA looks to you.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid max-w-md grid-cols-3 gap-3">
                    {options.map((o) => (
                        <button
                            key={o.value}
                            type="button"
                            onClick={() => setTheme(o.value)}
                            className={cn(
                                "relative flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-sm transition-colors hover:bg-accent",
                                theme === o.value && "border-primary ring-1 ring-primary/30",
                            )}
                        >
                            <o.icon className="h-5 w-5" />
                            <span className="font-medium">{o.label}</span>
                            {theme === o.value && (
                                <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}