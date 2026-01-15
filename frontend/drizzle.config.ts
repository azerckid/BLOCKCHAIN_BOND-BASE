import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./app/db/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL || "file:local.db",
        token: process.env.TURSO_AUTH_TOKEN,
    },
});
