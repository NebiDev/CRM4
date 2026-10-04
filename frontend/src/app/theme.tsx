import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
interface ThemeCtx {
    theme: Theme;
    setTheme: (t: Theme) => void;
    resolved: "light" | "dark";
}

const Ctx = createContext<ThemeCtx | null>(null);
const STORAGE_KEY = "nexa.theme";

function resolveTheme(theme: Theme): "light" | "dark" {
    if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(
        () => (localStorage.getItem(STORAGE_KEY) as Theme) ?? "system",
    );
    const [resolved, setResolved] = useState<"light" | "dark">(() => resolveTheme(theme));

    useEffect(() => {
        const next = resolveTheme(theme);
        setResolved(next);
        document.documentElement.classList.toggle("dark", next === "dark");
    }, [theme]);

    useEffect(() => {
        if (theme !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            const next = mq.matches ? "dark" : "light";
            setResolved(next);
            document.documentElement.classList.toggle("dark", next === "dark");
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [theme]);

    const setTheme = (t: Theme) => {
        localStorage.setItem(STORAGE_KEY, t);
        setThemeState(t);
    };

    return <Ctx.Provider value={{ theme, setTheme, resolved }}>{children}</Ctx.Provider>;
}

export function useTheme() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
    return ctx;
}