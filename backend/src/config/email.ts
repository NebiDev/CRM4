import { Resend } from "resend";
import { env } from "./env.js";

let client: Resend | null = null;

export function getEmailClient(): Resend | null {
    if (!env.RESEND_API_KEY) return null;
    if (!client) client = new Resend(env.RESEND_API_KEY);
    return client;
}

export const EMAIL_FROM = env.EMAIL_FROM ?? "NEXA <onboarding@resend.dev>";

export function isEmailEnabled(): boolean {
    return !!env.RESEND_API_KEY;
}