import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./dashboard/Sidebar";
import { Topbar } from "./dashboard/Topbar";

export function DashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border">
                <Sidebar />
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative z-50 w-64 border-r border-border bg-background">
                        <Sidebar onNavigate={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar onOpenSidebar={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}