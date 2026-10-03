export class AppError extends Error {
    public readonly status: number;
    public readonly code: string;
    public readonly details?: unknown;

    constructor(
        status: number,
        code: string,
        message: string,
        details?: unknown,
    ) {
        super(message);
        this.name = "AppError";
        this.status = status;
        this.code = code;
        this.details = details;
        Error.captureStackTrace?.(this, AppError);
    }

    static badRequest(message = "Bad request", details?: unknown) {
        return new AppError(400, "BAD_REQUEST", message, details);
    }
    static unauthorized(message = "Unauthorized") {
        return new AppError(401, "UNAUTHORIZED", message);
    }
    static forbidden(message = "Forbidden") {
        return new AppError(403, "FORBIDDEN", message);
    }
    static notFound(message = "Not found") {
        return new AppError(404, "NOT_FOUND", message);
    }
    static conflict(message = "Conflict") {
        return new AppError(409, "CONFLICT", message);
    }
    static internal(message = "Internal server error") {
        return new AppError(500, "INTERNAL", message);
    }
}