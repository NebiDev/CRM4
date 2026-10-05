import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";

export interface ContactPayload {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    services?: string[];
    message: string;
    website?: string; // honeypot — leave empty
}

export function useSubmitContact() {
    return useMutation({
        mutationFn: async (input: ContactPayload) => {
            const res = await apiPost<{ data: { queued: boolean } }>("/api/contact", input);
            return res.data;
        },
        onSuccess: () => toast.success("Message sent — we'll be in touch within 24 hours."),
        onError: (e: Error) => toast.error(e.message),
    });
}