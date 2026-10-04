import { Routes, Route, Navigate } from "react-router-dom";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { RequireAuth } from "./require-auth";
import { RedirectIfAuth } from "./redirect-if-auth";

// Placeholder pages — real content lands in Phases 13–17
import { HomePage } from "@/pages/marketing/HomePage";
import { ServicesPage } from "@/pages/marketing/ServicesPage";
import { ContactPage } from "@/pages/marketing/ContactPage";
import { PricingPage } from "@/pages/marketing/PricingPage";
import { ClientDetailPage } from "@/pages/app/ClientDetailPage";
import { ProjectDetailPage } from "@/pages/app/ProjectDetailPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { DashboardPage } from "@/pages/app/DashboardPage";
import { ClientsPage } from "@/pages/app/ClientsPage";
import { ProjectsPage } from "@/pages/app/ProjectsPage";
import { TasksPage } from "@/pages/app/TasksPage";
import { InvoicesPage } from "@/pages/app/InvoicesPage";
import { FilesPage } from "@/pages/app/FilesPage";
import { TeamPage } from "@/pages/app/TeamPage";
import { AcceptInvitationPage } from "@/pages/auth/AcceptInvitationPage";
import { SettingsPage } from "@/pages/app/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { TaskDetailPage } from "@/pages/app/TaskDetailPage";
import { InvoiceDetailPage } from "@/pages/app/InvoiceDetailPage";

export function AppRouter() {
    return (
        <Routes>
            {/* Marketing */}
            <Route element={<MarketingLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Auth */}
            <Route
                path="/login"
                element={
                    <RedirectIfAuth>
                        <LoginPage />
                    </RedirectIfAuth>
                }
            />
            <Route
                path="/register"
                element={
                    <RedirectIfAuth>
                        <RegisterPage />
                    </RedirectIfAuth>
                }
            />
            <Route
                path="/accept-invitation"
                element={
                    <AcceptInvitationPage />
                }
            />

            {/* App */}
            <Route
                path="/app"
                element={
                    <RequireAuth>
                        <DashboardLayout />
                    </RequireAuth>
                }
            >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="clients/:id" element={<ClientDetailPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="tasks/:id" element={<TaskDetailPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="files" element={<FilesPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}