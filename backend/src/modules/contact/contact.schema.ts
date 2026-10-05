import { z } from "zod";

export const ContactSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(200),
    email: z.string().trim().email("Invalid email").max(200),
    company: z.string().trim().max(200).optional().or(z.literal("")),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    services: z.array(z.string().trim().max(100)).max(20).optional().default([]),
    message: z.string().trim().min(10, "Please tell us a bit more").max(5000),
    // honeypot — must be empty. Real users never fill this.
    website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof ContactSchema>;