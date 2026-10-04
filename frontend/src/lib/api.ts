const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
    status: number;
    code: string;
    details?: unknown;

    constructor(status: number, code: string, message: string, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
    query?: Record<string, string | number | undefined | null>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
    const url = new URL(`${API_URL}${path}`);
    if (query) {
        for (const [k, v] of Object.entries(query)) {
            if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
        }
    }
    return url.toString();
}

export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, query, headers, ...rest } = options;

    const res = await fetch(buildUrl(path, query), {
        ...rest,
        credentials: "include",
        headers: {
            ...(body ? { "Content-Type": "application/json" } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
        const err = (payload as any)?.error ?? {};
        throw new ApiError(
            res.status,
            err.code ?? "UNKNOWN",
            err.message ?? res.statusText,
            err.details,
        );
    }

    return payload as T;
}

export const apiGet = <T>(path: string, query?: RequestOptions["query"]) =>
    api<T>(path, { method: "GET", query });

export const apiPost = <T>(path: string, body?: unknown) =>
    api<T>(path, { method: "POST", body });

export const apiPatch = <T>(path: string, body?: unknown) =>
    api<T>(path, { method: "PATCH", body });

export const apiDelete = <T>(path: string) =>
    api<T>(path, { method: "DELETE" });