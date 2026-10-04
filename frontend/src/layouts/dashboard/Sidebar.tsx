import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    CheckSquare,
    FileText,
    Files,
    UserCog,
    Settings,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    dividerBefore?: boolean;
}

const items: NavItem[] = [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/clients", label: "Clients", icon: Users },
    { to: "/app/projects", label: "Projects", icon: FolderKanban },
    { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
    { to: "/app/invoices", label: "Invoices", icon: FileText },
    { to: "/app/files", label: "Files", icon: Files },
    { to: "/app/team", label: "Team", icon: UserCog, dividerBefore: true },
    { to: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <nav className="flex h-full flex-col">
            <div className="flex h-16 items-center gap-2 border-b border-border px-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-base font-semibold">NEXA</span>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto p-3">
                {items.map((item) => (
                    <div key={item.to}>
                        {item.dividerBefore && <div className="my-2 border-t border-border" />}
                        <NavLink
                            to={item.to}
                            onClick={onNavigate}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                )
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    </div>
                ))}
            </div>
        </nav>
    );
}