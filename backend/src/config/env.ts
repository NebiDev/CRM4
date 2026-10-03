import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: z.coerce.number().int().positive().default(4000),

    // Required from Phase 2 onward — left optional now so Phase 1 can boot.
    DATABASE_URL: z.string().url().optional(),
    BETTER_AUTH_SECRET: z.string().min(16).optional(),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:4000"),

    FRONTEND_URL: z.string().url().default("http://localhost:5173"),

    // Phase 9+
    AWS_REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),

    // Phase 16+
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;