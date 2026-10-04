export function formatCurrency(value: string | number, currency = "USD"): string {
    const n = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(n)) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(n);
}

export function formatDate(input: string | Date | null | undefined): string {
    if (!input) return "—";
    const d = typeof input === "string" ? new Date(input) : input;
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(d);
}

export function formatRelative(input: string | Date): string {
    const d = typeof input === "string" ? new Date(input) : input;
    const diff = Date.now() - d.getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(d);
}