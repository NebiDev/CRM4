import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

export function createApp() {
    const app = express();

    app.disable("x-powered-by");
    app.use(helmet());

    app.use(
        cors({
            origin: env.FRONTEND_URL,
            credentials: true,
        }),
    );

    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    if (env.NODE_ENV !== "test") {
        app.use(
            pinoHttp({
                transport:
                    env.NODE_ENV === "development"
                        ? {
                            target: "pino-pretty",
                            options: { colorize: true, translateTime: "HH:MM:ss" },
                        }
                        : undefined,
                autoLogging: {
                    ignore: (req) => req.url === "/api/health",
                },
            }),
        );
    }

    // ── Routes ─────────────────────────────────────────────
    app.get("/api/health", (_req, res) => {
        res.json({
            status: "ok",
            service: "nexa-api",
            version: "0.1.0",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    });

    // ── 404 + error handlers (must be last) ────────────────
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}