import { Bell, LogOut, Menu, Moon, Search, Sun, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/app/theme";
import { authClient, useSession } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
    const { data } = useSession();
    const { theme, setTheme, resolved } = useTheme();
    const navigate = useNavigate();

    const user = data?.user;
    const initials = user?.name ?? user?.email ?? "U";

    const handleSignOut = async () => {
        await authClient.signOut();
        navigate("/login");
    };

    return (
        <header className="flex h-16 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
            <button
                onClick={onOpenSidebar}
                className="rounded-md p-2 hover:bg-accent md:hidden"
                aria-label="Open navigation"
            >
                <Menu className="h-5 w-5" />
            </button>

            <div className="relative hidden flex-1 max-w-md md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search…" className="pl-9" />
            </div>

            <div className="ml-auto flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
                    aria-label="Toggle theme"
                >
                    {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <Button variant="ghost" size="icon" aria-label="Notifications">
                    <Bell className="h-4 w-4" />
                </Button>

                <Dropdown
                    trigger={
                        <button className="rounded-full focus:outline-none">
                            <Avatar name={initials} size="sm" />
                        </button>
                    }
                >
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        {user?.email ?? "—"}
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