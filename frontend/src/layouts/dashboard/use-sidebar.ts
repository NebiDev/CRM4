import { useEffect, useState } from "react";

const KEY = "nexa.sidebar.collapsed";

export function useSidebar() {
    const [collapsed, setCollapsed] = useState(
        () => localStorage.getItem(KEY) === "true",
    );

    useEffect(() => {
        localStorage.setItem(KEY, String(collapsed));
    }, [collapsed]);

    return { collapsed, toggle: () => setCollapsed((v) => !v) };
}