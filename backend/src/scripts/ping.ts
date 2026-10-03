// Placeholder until Phase 2 wires Prisma.
// Phase 1: just proves tsx + env validation run.
import { env } from "../config/env.js";

console.log("Environment OK:", {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    FRONTEND_URL: env.FRONTEND_URL,
    DATABASE_URL: env.DATABASE_URL ? "(set)" : "(not set yet — fine for Phase 1)",
});