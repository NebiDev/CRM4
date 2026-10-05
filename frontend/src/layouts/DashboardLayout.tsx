import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSidebar } from "./dashboard/use-sidebar";
import { Sidebar } from "./dashboard/Sidebar";
import { Topbar } from "./dashboard/Topbar";

export function DashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { collapsed, toggle } = useSidebar();

    return (
        <div className="flex h-screen overflow-hidden bg-background  ">
            {/* Desktop sidebar */}
            <aside
                className={[
                    "hidden shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col",
                    "transition-[width] duration-200 ease-out",
                    collapsed ? "md:w-[68px]" : "md:w-64",
                ].join(" ")}
            >
                <Sidebar collapsed={collapsed} onToggleCollapse={toggle} />
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative z-50 w-64 border-r border-sidebar-border bg-sidebar animate-slide-up">
                        <Sidebar
                            collapsed={false}
                            onToggleCollapse={undefined}
                            onNavigate={() => setMobileOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Main area */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Topbar onOpenSidebar={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}