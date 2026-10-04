import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";
import { requireAuth } from "./middleware/require-auth.js";
import { requireOrg } from "./middleware/require-org.js";
import { authorize } from "./middleware/authorize.js";
import type { Permission } from "./shared/permissions.js";
import "./config/s3.js"
import { clientsRouter } from "./modules/clients/client.routes.js";
import { projectsRouter } from "./modules/projects/project.routes.js";
import { tasksRouter } from "./modules/tasks/task.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { filesRouter } from "./modules/files/file.routes.js";

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

    app.use("/api/auth", toNodeHandler(auth));

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

    app.get("/api/me", requireAuth, (req, res) => {
        res.json({
            user: req.user,
            membership: req.membership ?? null,
        });
    });

    app.get(
        "/api/me/org",
        requireAuth,
        requireOrg,
        (req, res) => {
            res.json({ membership: req.membership });
        },
    );
    
    

    // Tiny permission probe — proves the matrix fires.
    const probe: Permission = "clients.create";
    app.get(
        "/api/me/can-create-clients",
        requireAuth,
        requireOrg,
        authorize(probe),
        (_req, res) => res.json({ allowed: true, permission: probe }),
    );

    app.use("/api/clients", clientsRouter);
    app.use("/api/projects", projectsRouter);
    app.use("/api/tasks", tasksRouter);
    app.use("/api/dashboard", dashboardRouter);
    app.use("/api/files", filesRouter);

    // ── 404 + error handlers (must be last) ────────────────
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}