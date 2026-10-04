import { Link, Outlet } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function MarketingLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
                <div className="container flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="text-base font-semibold">NEXA</span>
                    </Link>

                    <nav className="hidden items-center gap-6 text-sm md:flex">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <Link to="/services" className="hover:text-primary">Services</Link>
                        <Link to="/pricing" className="hover:text-primary">Pricing</Link>
                        <Link to="/contact" className="hover:text-primary">Contact</Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <Link to="/login">
                            <Button variant="ghost" size="sm">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t border-border bg-muted/40">
                <div className="container flex h-16 items-center justify-between text-xs text-muted-foreground">
                    <span>© {new Date().getFullYear()} NEXA. All rights reserved.</span>
                    <span>Privacy · Terms</span>
                </div>
            </footer>
        </div>
    );
}