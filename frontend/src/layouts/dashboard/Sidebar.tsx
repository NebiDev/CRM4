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
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const groups: NavGroup[] = [
    {
        label: "Workspace",
        items: [
            { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { to: "/app/clients", label: "Clients", icon: Users },
            { to: "/app/projects", label: "Projects", icon: FolderKanban },
            { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
        ],
    },
    {
        label: "Finance",
        items: [
            { to: "/app/invoices", label: "Invoices", icon: FileText },
            { to: "/app/files", label: "Files", icon: Files },
        ],
    },
    {
        label: "Admin",
        items: [
            { to: "/app/team", label: "Team", icon: UserCog },
            { to: "/app/settings", label: "Settings", icon: Settings },
        ],
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggleCollapse?: () => void;
    onNavigate?: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, onNavigate }: SidebarProps) {
    return (
        <nav className="flex h-full min-h-0 flex-col">
            {/* Brand */}
            <div
                className={cn(
                    "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4",
                    collapsed && "justify-center px-2",
                )}
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                </div>
                {!collapsed && (
                    <span className="truncate text-base font-semibold tracking-tight">
                        NEXA
                    </span>
                )}
            </div>

            {/* Nav */}
            <div className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
                {groups.map((group) => (
                    <div key={group.label}>
                        {!collapsed && (
                            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <NavItemLink
                                    key={item.to}
                                    item={item}
                                    collapsed={collapsed}
                                    onClick={onNavigate}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Collapse toggle (desktop only) */}
            {onToggleCollapse && (
                <div className="shrink-0 border-t border-sidebar-border p-2">
                    <button
                        onClick={onToggleCollapse}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            collapsed && "justify-center px-2",
                        )}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? (
                            <Tooltip content="Expand">
                                <PanelLeftOpen className="h-4 w-4" />
                            </Tooltip>
                        ) : (
                            <>
                                <PanelLeftClose className="h-4 w-4" />
                                <span>Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </nav>
    );
}

function NavItemLink({
    item,
    collapsed,
    onClick,
}: {
    item: NavItem;
    collapsed: boolean;
    onClick?: () => void;
}) {
    const Icon = item.icon;

    const link = (
        <NavLink
            to={item.to}
            onClick={onClick}
            className={({ isActive }) =>
                cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-2",
                    isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )
            }
        >
            {({ isActive }) => (
                <>
                    {/* Active indicator bar */}
                    <span
                        className={cn(
                            "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-primary transition-opacity",
                            isActive ? "opacity-100" : "opacity-0",
                        )}
                    />
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                </>
            )}
        </NavLink>
    );

    return collapsed ? <Tooltip content={item.label}>{link}</Tooltip> : link;
}