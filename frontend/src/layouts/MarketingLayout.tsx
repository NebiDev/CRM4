import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { LinkButton } from "@/components/ui/LinkButton";

const nav = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
];

export function MarketingLayout() {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();

    // Close mobile menu on route change + scroll to top
    useEffect(() => {
        setOpen(false);
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
                <div className="container flex h-16 items-center justify-between gap-6">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="text-base font-semibold tracking-tight">NEXA</span>
                    </Link>

                    <nav className="hidden items-center gap-7 text-sm md:flex">
                        {nav.map((n) => (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                className={({ isActive }) =>
                                    cn(
                                        "transition-colors hover:text-primary",
                                        isActive ? "text-primary font-medium" : "text-foreground/70",
                                    )
                                }
                            >
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-2 md:flex">
                        <LinkButton to="/login" variant="ghost" size="sm">Login</LinkButton>
                        <LinkButton to="/register" size="sm">Get Started</LinkButton>
                    </div>

                    <button
                        className="rounded-md p-2 hover:bg-accent md:hidden"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {open && (
                    <div className="border-t border-border bg-background md:hidden">
                        <div className="container flex flex-col gap-2 py-4">
                            {nav.map((n) => (
                                <NavLink
                                    key={n.to}
                                    to={n.to}
                                    className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                                >
                                    {n.label}
                                </NavLink>
                            ))}
                            <div className="mt-2 flex gap-2">
                                <LinkButton to="/login" variant="outline" className="flex-1" size="sm">Login</LinkButton>
                                <LinkButton to="/register" className="flex-1" size="sm">Get Started</LinkButton>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <MarketingFooter />
        </div>
    );
}

function MarketingFooter() {
    return (
        <footer className="border-t border-border bg-secondary/40">
            <div className="container py-14">
                <div className="grid gap-10 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <span className="text-base font-semibold">NEXA</span>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            We modernize how small businesses operate — building scalable digital infrastructure for the future.
                        </p>
                        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                            <p>hello@nexa.studio</p>
                            <p>+1 (555) 123-4567</p>
                            <p>Remote worldwide</p>
                        </div>
                    </div>

                    <FooterCol
                        title="Services"
                        links={[
                            ["Website & Web Apps", "/services#web"],
                            ["Business Automation", "/services#automation"],
                            ["Payroll & Accounting", "/services#payroll"],
                            ["Custom Internal Tools", "/services#tools"],
                        ]}
                    />
                    <FooterCol
                        title="Company"
                        links={[
                            ["About Us", "/about"],
                            ["Contact", "/contact"],
                            ["Pricing", "/pricing"],
                        ]}
                    />
                    <FooterCol
                        title="Legal"
                        links={[
                            ["Privacy Policy", "/legal/privacy"],
                            ["Terms of Service", "/legal/terms"],
                        ]}
                    />
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} NEXA. All rights reserved.</span>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-foreground">LinkedIn</a>
                        <a href="#" className="hover:text-foreground">Twitter</a>
                        <a href="#" className="hover:text-foreground">GitHub</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
    return (
        <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {links.map(([label, to]) => (
                    <li key={to}>
                        <Link to={to} className="hover:text-foreground">{label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}