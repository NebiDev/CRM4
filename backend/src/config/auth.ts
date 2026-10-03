import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { db } from "./db.js";
import { env } from "./env.js";

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),

    // 32+ byte secret from BETTER_AUTH_SECRET
    secret: env.BETTER_AUTH_SECRET!,
    baseURL: env.BETTER_AUTH_URL,

    emailAndPassword: {
        enabled: true,
        // We'll flip this to true in Phase 16 when Resend is wired.
        requireEmailVerification: false,
        minPasswordLength: 8,
    },

    // Better Auth reads/writes through the cookie set here.
    // The frontend at FRONTEND_URL is allowed to send credentials.
    trustedOrigins: [env.FRONTEND_URL, env.BETTER_AUTH_URL],

    advanced: {
        cookiePrefix: "nexa",
        // In production over HTTPS this should be "__Secure-nexa".
        // Leave default for local dev.
    },

    plugins: [
        organization({
            // Fixed MVP roles. Custom roles come post-MVP.
            // "owner" is built in; we add the rest.
            // See Better Auth docs for allowedRoles config shape.
        }),
    ],
});