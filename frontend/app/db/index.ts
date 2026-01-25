import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Helper to safely get environment variables
const getEnv = (key: string): string | undefined => {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    // @ts-ignore
    return import.meta.env[key] || import.meta.env[`VITE_${key}`];
};

const url = getEnv("TURSO_DATABASE_URL") || "file:local.db";
const authToken = getEnv("TURSO_AUTH_TOKEN");

const client = createClient({
    url,
    authToken,
});

export const db = drizzle(client, { schema });
