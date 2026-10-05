import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { FadeIn, SlideUp } from "@/components/ui/motion";
import { useSubmitContact } from "@/features/contact/hooks";

const SERVICE_OPTIONS = [
    "Website & Web Apps",
    "Business Automation",
    "Payroll & Accounting Systems",
    "Custom Internal Tools",
    "Digital Transformation Consulting",
];

const Schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    company: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    services: z.array(z.string()).default([]),
    message: z.string().min(10, "Please tell us a bit more"),
    website: z.string().max(0).optional().or(z.literal("")), // honeypot
});
type Values = z.infer<typeof Schema>;

export function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const submit = useSubmitContact();

    const form = useForm<Values>({
        resolver: zodResolver(Schema),
        defaultValues: {
            name: "",
            email: "",
            company: "",
            phone: "",
            services: [],
            message: "",
            website: "",
        },
    });

    const onSubmit = async (values: Values) => {
        await submit.mutateAsync(values);
        setSubmitted(true);
        form.reset();
    };

    return (
        <section className="container py-16 md:py-24">
            <SlideUp>
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        Let's build your <span className="text-primary">digital future</span>
                    </h1>
                    <p className="mt-4 text-muted-foreground">
                        Ready to modernize your business operations? Schedule a consultation
                        with our experts to discuss your automation needs.
                    </p>
                </div>
            </SlideUp>

            <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
                <FadeIn>
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold">Get in touch</h2>

                        <InfoRow icon={<Mail className="h-4 w-4" />} label="Email">
                            <p>hello@nexa.studio</p>
                            <p>support@nexa.studio</p>
                        </InfoRow>
                        <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone">
                            <p>+1 (555) 123-4567</p>
                            <p>+1 (555) 987-6543</p>
                        </InfoRow>
                        <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location">
                            <p>Remote worldwide</p>
                            <p>Based in the US</p>
                        </InfoRow>
                        <InfoRow icon={<Clock className="h-4 w-4" />} label="Hours">
                            <p>Mon–Fri: 9am–6pm PST</p>
                            <p>24/7 Emergency support</p>
                        </InfoRow>

                        <Card className="mt-8 border-primary/20 bg-primary/5">
                            <CardContent className="flex gap-3 p-4">
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                                <div>
                                    <p className="text-sm font-semibold">Quick response guarantee</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        We respond to all inquiries within 24 hours during business
                                        days. For urgent matters, call our emergency support line.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </FadeIn>

                <FadeIn delay={0.1}>
                    <Card>
                        <CardContent className="p-8">
                            {submitted ? (
                                <div className="flex flex-col items-center gap-4 py-10 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-lg font-semibold">Message sent</h2>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Thanks for reaching out. We'll get back to you within 24 hours
                                        during business days.
                                    </p>
                                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                                        Send another message
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-semibold">Send us a message</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Fill out the form and we'll get back to you as soon as possible.
                                    </p>

                                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full name *</Label>
                                                <Input id="name" {...form.register("name")} />
                                                {form.formState.errors.name && (
                                                    <p className="text-xs text-destructive">
                                                        {form.formState.errors.name.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email *</Label>
                                                <Input id="email" type="email" {...form.register("email")} />
                                                {form.formState.errors.email && (
                                                    <p className="text-xs text-destructive">
                                                        {form.formState.errors.email.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="company">Company</Label>
                                                <Input id="company" {...form.register("company")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input id="phone" {...form.register("phone")} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Services of interest</Label>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {SERVICE_OPTIONS.map((s) => (
                                                    <label key={s} className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            value={s}
                                                            className="h-4 w-4"
                                                            {...form.register("services")}
                                                        />
                                                        {s}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">How can we help you? *</Label>
                                            <Textarea
                                                id="message"
                                                rows={5}
                                                placeholder="Tell us about your business challenges and goals…"
                                                {...form.register("message")}
                                            />
                                            {form.formState.errors.message && (
                                                <p className="text-xs text-destructive">
                                                    {form.formState.errors.message.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Honeypot — hidden from real users, visible to bots */}
                                        <div className="hidden" aria-hidden>
                                            <label>
                                                Website
                                                <input type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
                                            </label>
                                        </div>

                                        <Button type="submit" className="w-full" disabled={submit.isPending}>
                                            {submit.isPending ? <Spinner /> : "Send message"}
                                        </Button>

                                        <p className="text-center text-xs text-muted-foreground">
                                            We respect your privacy. By submitting, you agree to be contacted
                                            about our services.
                                        </p>
                                    </form>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>
        </section>
    );
}

function InfoRow({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium">{label}</p>
                <div className="mt-0.5 text-sm text-muted-foreground">{children}</div>
            </div>
        </div>
    );
}