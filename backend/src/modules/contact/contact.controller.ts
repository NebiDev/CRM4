import type { Request, Response } from "express";
import { sendEmail } from "../../shared/email.js";
import { ContactSchema } from "./contact.schema.js";
import { env } from "../../config/env.js";

const TO = process.env.CONTACT_INBOX ?? "hello@nexa.local";

function renderContactEmail(input: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    services: string[];
    message: string;
}) {
    const lines = [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        input.company ? `Company: ${input.company}` : null,
        input.phone ? `Phone: ${input.phone}` : null,
        input.services.length ? `Services: ${input.services.join(", ")}` : null,
        "",
        input.message,
    ].filter(Boolean);

    const text = lines.join("\n");
    const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;padding:24px;">
      <h2 style="margin:0 0 12px;">New contact request</h2>
      <pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.6;">${text.replace(/</g, "&lt;")}</pre>
    </div>
  `;

    return {
        to: TO,
        subject: `New enquiry from ${input.name}`,
        html,
        text,
        replyTo: input.email,
    };
}

export async function submit(req: Request, res: Response) {
    const input = ContactSchema.parse(req.body);

    // Honeypot: silently accept and drop if filled.
    if (input.website) {
        res.json({ data: { queued: true } });
        return;
    }

    void sendEmail(renderContactEmail(input));

    res.json({ data: { queued: true } });
}