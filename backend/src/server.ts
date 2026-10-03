import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
    console.log(`✅ NEXA API listening on http://localhost:${env.PORT}`);
    console.log(`   env: ${env.NODE_ENV}`);
});

const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully…`);
    server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));