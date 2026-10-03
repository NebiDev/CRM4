import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

declare global {
    // eslint-disable-next-line no-var
    var __nexaPrisma: PrismaClient | undefined;
}

export const db =
    globalThis.__nexaPrisma ??
    new PrismaClient({
        log:
            env.NODE_ENV === "development"
                ? ["warn", "error"]
                : ["error"],
    });

if (env.NODE_ENV !== "production") {
    globalThis.__nexaPrisma = db;
}