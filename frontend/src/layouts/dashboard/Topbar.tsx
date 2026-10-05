import { Bell, LogOut, Menu, Moon, Search, Sun, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/app/theme";
import { authClient, useSession } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { Tooltip } from "@/components/ui/Tooltip";

function useBreadcrumbs() {
    const { pathname } = useLocation();
    const parts = pathname.replace(/^\/app\/?/, "").split("/").filter(Boolean);
    return parts.length ? parts : ["dashboard"];
}

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
    const { data } = useSession();
    const { resolved, setTheme } = useTheme();
    const navigate = useNavigate();
    const crumbs = useBreadcrumbs();

    const user = data?.user;
    const displayName = user?.name ?? user?.email ?? "U";

    const handleSignOut = async () => {
        await authClient.signOut();
        navigate("/login");
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
            <button
                onClick={onOpenSidebar}
                className="rounded-md p-2 hover:bg-accent md:hidden"
                aria-label="Open navigation"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden min-w-0 items-center gap-2 text-sm md:flex">
                <span className="text-muted-foreground">NEXA</span>
                {crumbs.map((c, i) => (
                    <span key={i} className="flex items-center gap-2">
                        <span className="text-muted-foreground">/</span>
                        <span
                            className={
                                i === crumbs.length - 1
                                    ? "font-medium capitalize text-foreground"
                                    : "capitalize text-muted-foreground"
                            }
                        >
                            {c.replace(/-/g, " ")}
                        </span>
                    </span>
                ))}
            </nav>

            <div className="ml-auto flex items-center gap-1.5">
                <div className="relative hidden max-w-xs md:block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search…"
                        className="h-9 w-56 pl-9 pr-14"
                        disabled
                    />
                    <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        ⌘K
                    </kbd>
                </div>

                <Tooltip content={resolved === "dark" ? "Light mode" : "Dark mode"}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
                        aria-label="Toggle theme"
                    >
                        {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                </Tooltip>

                <Tooltip content="Notifications">
                    <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                        <Bell className="h-4 w-4" />
                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    </Button>
                </Tooltip>

                <Dropdown
                    trigger={
                        <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <Avatar name={displayName} size="sm" />
                        </button>
                    }
                >
                    <div className="px-2 py-1.5">
                        <p className="text-sm font-medium truncate">{user?.name ?? "Signed in"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="my-1 border-t border-border" />
                    <DropdownItem onClick={() => navigate("/app/settings")}>
                        <User className="h-4 w-4" /> Account
                    </DropdownItem>
                    <DropdownItem onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" /> Sign out
                    </DropdownItem>
                </Dropdown>
            </div>
        </header>
    );
}