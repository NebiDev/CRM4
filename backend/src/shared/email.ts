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



export interface SendEmailInput {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
    console.log("[email] sendEmail called with:", {
        to: input.to,
        toType: typeof input.to,
        toIsArray: Array.isArray(input.to),
        subject: input.subject,
    });

    const client = getEmailClient();
    if (!client) {
        console.warn("[email] RESEND_API_KEY not set — skipping send");
        return;
    }

    // Guard: coerce and validate before hitting Resend.
    const recipients = Array.isArray(input.to)
        ? input.to.map((s) => s.trim()).filter(Boolean)
        : typeof input.to === "string"
            ? [input.to.trim()].filter(Boolean)
            : [];

    if (recipients.length === 0) {
        console.warn("[email] no valid recipients — skipping send. Raw input.to:", input.to);
        return;
    }

    try {
        const result = await client.emails.send({
            from: EMAIL_FROM,
            to: recipients,
            subject: input.subject,
            html: input.html,
            text: input.text,
            replyTo: input.replyTo,
        });

        console.log("[email] resend response:", result);
        if (result.error) console.warn("[email] provider error", result.error);
    } catch (err) {
        console.warn("[email] send failed", err);
    }
}




// export async function sendEmail(input: SendEmailInput): Promise<void> {
//     const client = getEmailClient();

//     if (!client) {
//         console.warn("[email] RESEND_API_KEY not set — skipping send:", input.subject);
//         return;
//     }

//     try {
//         const result = await client.emails.send({
//             from: EMAIL_FROM,
//             to: input.to,
//             subject: input.subject,
//             html: input.html,
//             text: input.text,
//             replyTo: input.replyTo,
//         });

//         if (result.error) {
//             console.warn("[email] provider error", result.error);
//             return;
//         }

//         console.info("[email] accepted by provider", {
//             emailId: result.data?.id,
//             subject: input.subject,
//         });


//     } catch (err) {
//         console.warn("[email] send failed", err);
//     }
// }