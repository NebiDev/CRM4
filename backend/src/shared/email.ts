import { getEmailClient, EMAIL_FROM } from "../config/email.js";

export interface SendEmailInput {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
}

/**
 * Fire-and-forget email send. Failures are logged, never thrown, so an
 * email provider hiccup can't break a domain operation.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
    const client = getEmailClient();

    if (!client) {
        console.warn("[email] RESEND_API_KEY not set — skipping send:", input.subject);
        return;
    }

    try {
        const result = await client.emails.send({
            from: EMAIL_FROM,
            to: input.to,
            subject: input.subject,
            html: input.html,
            text: input.text,
            replyTo: input.replyTo,
        });

        if (result.error) {
            console.warn("[email] provider error", result.error);
        }
    } catch (err) {
        console.warn("[email] send failed", err);
    }
}