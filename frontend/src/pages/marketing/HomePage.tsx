import { Link } from "react-router-dom";
import {
    ArrowRight,
    BarChart3,
    Building2,
    CheckCircle2,
    Clock,
    Cog,
    LineChart,
    Lock,
    ShieldCheck,
    Sparkles,
    Users,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/ui/motion";

export function HomePage() {
    return (
        <>
            <Hero />
            <StatsBar />
            <Services />
            <HowWeWork />
            <CaseStudy />
            <FinalCta />
        </>
    );
}

/* ──────────────────────────────────────────────────── */
/* Hero                                                  */
/* ──────────────────────────────────────────────────── */

function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-border">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,theme(colors.primary/10),transparent)]"
            />
            <div className="container relative grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
                <SlideUp>
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-primary" />
                        Digital infrastructure for small business
                    </p>
                    <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                        Digital systems that save you{" "}
                        <span className="text-primary">time, money, and stress</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                        We build payroll automation, internal tools, and custom websites for
                        small businesses that have outgrown manual work.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/contact">
                            <Button size="lg">
                                Book a free consultation <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <a href="#how-we-work">
                            <Button size="lg" variant="outline">See how it works</Button>
                        </a>
                    </div>
                </SlideUp>

                <SlideUp delay={0.1}>
                    <DashboardMockup />
                </SlideUp>
            </div>
        </section>
    );
}

function DashboardMockup() {
    const metrics = [
        { label: "Revenue", value: "68%", color: "bg-primary" },
        { label: "Tasks done", value: "92%", color: "bg-emerald-500" },
        { label: "On-time", value: "85%", color: "bg-amber-500" },
        { label: "Errors", value: "4%", color: "bg-rose-500" },
    ];
    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs text-muted-foreground">Dashboard • Live</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {metrics.map((m) => (
                    <div key={m.label}>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{m.label}</span>
                            <span className="font-medium text-foreground">{m.value}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div className={`h-full ${m.color}`} style={{ width: m.value }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────── */
/* Stats                                                 */
/* ──────────────────────────────────────────────────── */

function StatsBar() {
    const stats = [
        { value: "100+", label: "Businesses modernized" },
        { value: "60%", label: "Average time saved" },
        { value: "24/7", label: "System monitoring" },
        { value: "99.9%", label: "Uptime guarantee" },
    ];
    return (
        <section className="border-b border-border bg-secondary/40">
            <div className="container grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
                {stats.map((s) => (
                    <FadeIn key={s.label}>
                        <div className="text-center md:text-left">
                            <p className="text-2xl font-semibold text-primary md:text-3xl">{s.value}</p>
                            <p className="mt-1 text-xs text-muted-foreground md:text-sm">{s.label}</p>
                        </div>
                    </FadeIn>
                ))}
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────────── */
/* Services                                              */
/* ──────────────────────────────────────────────────── */

const services = [
    {
        icon: Cog,
        title: "Business Automation",
        description:
            "Eliminate manual work with intelligent workflows and process optimization.",
        accent: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
    {
        icon: BarChart3,
        title: "Digital Infrastructure",
        description:
            "Modern, scalable websites and applications built for growth.",
        accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
        icon: Lock,
        title: "Payroll & Accounting Systems",
        description:
            "Secure, compliant financial systems tailored to your business.",
        accent: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    },
    {
        icon: Users,
        title: "Custom Internal Tools",
        description:
            "Dashboards, employee management, and reporting systems.",
        accent: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
];

function Services() {
    return (
        <section id="services" className="border-b border-border">
            <div className="container py-20">
                <SlideUp>
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                            Comprehensive Digital Transformation
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            We build systems that grow with your business, eliminating manual work
                            and creating scalable digital infrastructure.
                        </p>
                    </div>
                </SlideUp>

                <Stagger delay={0.1}>
                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {services.map((s) => (
                            <StaggerItem key={s.title}>
                                <Card className="h-full">
                                    <CardContent className="p-6">
                                        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.accent}`}>
                                            <s.icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                                        <Link
                                            to="/services"
                                            className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                        >
                                            Learn more <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                </Stagger>
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────────── */
/* How we work                                           */
/* ──────────────────────────────────────────────────── */

const steps = [
    { n: "01", title: "Audit", description: "Comprehensive analysis of your current systems." },
    { n: "02", title: "Design", description: "Strategic planning and solution architecture." },
    { n: "03", title: "Build", description: "Development with modern technologies." },
    { n: "04", title: "Automate", description: "Implement smart workflows and automation." },
    { n: "05", title: "Support", description: "Ongoing maintenance and optimization." },
];

function HowWeWork() {
    return (
        <section id="how-we-work" className="border-b border-border bg-secondary/40">
            <div className="container py-20">
                <SlideUp>
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                            How We Work: Simple, Transparent, Effective
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            A proven five-step process that ensures your digital transformation is
                            smooth and successful.
                        </p>
                    </div>
                </SlideUp>

                <div className="relative mt-16">
                    <div
                        aria-hidden
                        className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-border md:block"
                    />
                    <div className="grid gap-10 md:grid-cols-5">
                        {steps.map((s, i) => (
                            <FadeIn key={s.n} delay={i * 0.08}>
                                <div className="flex flex-col items-start md:items-center md:text-center">
                                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-background text-sm font-semibold text-primary">
                                        {s.n}
                                    </div>
                                    <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────────── */
/* Case study                                            */
/* ──────────────────────────────────────────────────── */

function CaseStudy() {
    return (
        <section className="border-b border-border">
            <div className="container py-20">
                <SlideUp>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-blue-700 p-10 text-primary-foreground md:p-14">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                            <Clock className="h-3 w-3" /> Case study
                        </span>
                        <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
                            Reduced payroll processing time by 60% for a transportation company
                        </h2>
                        <p className="mt-5 max-w-2xl text-sm text-white/80 md:text-base">
                            By implementing automated payroll systems and custom reporting dashboards,
                            we helped a mid-sized logistics company streamline their financial operations
                            and reduce manual errors.
                        </p>

                        <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/20 pt-6">
                            {[
                                ["60%", "Time reduction"],
                                ["95%", "Error reduction"],
                                ["$50k+", "Annual savings"],
                            ].map(([v, l]) => (
                                <div key={l}>
                                    <p className="text-2xl font-semibold md:text-3xl">{v}</p>
                                    <p className="mt-1 text-xs text-white/70 md:text-sm">{l}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </SlideUp>
            </div>
        </section>
    );
}

/* ──────────────────────────────────────────────────── */
/* Final CTA                                             */
/* ──────────────────────────────────────────────────── */

function FinalCta() {
    return (
        <section className="border-b border-border">
            <div className="container py-24 text-center">
                <SlideUp>
                    <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                        Ready to modernize your business?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                        Join the growing number of small businesses that have transformed their
                        operations with our digital systems.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Link to="/contact">
                            <Button size="lg">
                                Start Your Digital Upgrade <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </SlideUp>
            </div>
        </section>
    );
}