import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./theme";

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    );

    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    {children}
                    <Toaster richColors position="top-right" />
                </BrowserRouter>
            </QueryClientProvider>
        </ThemeProvider>
    );
}