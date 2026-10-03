import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/errors.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
    res.status(404).json({
        error: { code: "NOT_FOUND", message: "Route not found" },
    });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    // Zod validation errors → 400 with field details
    if (err instanceof ZodError) {
        res.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request payload",
                details: err.flatten().fieldErrors,
            },
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.status).json({
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        });
        return;
    }

    // Unknown error — log and hide internals in production
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: { code: "INTERNAL", message: "Internal server error" },
    });
};