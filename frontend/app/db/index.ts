import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

const url = getEnv("TURSO_DATABASE_URL") || "file:local.db";
const authToken = getEnv("TURSO_AUTH_TOKEN");

const client = createClient({
    url,
    authToken,
});

export const db = drizzle(client, { schema });
/** Raw libsql client for fallback raw SQL (e.g. schema migration compatibility). */
export const dbClient = client;
