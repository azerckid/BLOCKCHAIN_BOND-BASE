import { z } from "zod";

/**
 * Server-side environment variable schema.
 * Validated on first getEnv() call in Node (Vercel serverless / SSR).
 * Not run in browser; getEnv() falls back to import.meta.env there.
 */
const serverEnvSchema = z.object({
    TURSO_DATABASE_URL: z.string().min(1, "TURSO_DATABASE_URL is required"),
    TURSO_AUTH_TOKEN: z.string().optional(),
    GEMINI_API_KEY: z.string().min(1).optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
    RELAYER_PRIVATE_KEY: z
        .string()
        .optional()
        .refine((s) => !s || (s.trim().startsWith("0x") && (s.trim().length === 66 || s.trim().length === 64)), "RELAYER_PRIVATE_KEY must be 0x-prefixed 64-char hex when set"),
    CHOONSIM_API_KEY: z.string().min(1, "CHOONSIM_API_KEY is required"),
    BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

function getServerEnv(): ServerEnv | undefined {
    if (typeof process === "undefined" || !process.env) return undefined;
    if (cached) return cached;
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
        const msg = parsed.error.flatten().fieldErrors;
        const details = Object.entries(msg)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("; ");
        throw new Error(`[env] Invalid or missing environment variables: ${details}`);
    }
    cached = parsed.data;
    return cached;
}

/**
 * Get environment variable. On server, validates all required server env vars on first call and returns from cache.
 * In browser, returns import.meta.env value (no validation).
 */
export function getEnv(key: string): string | undefined {
    const server = getServerEnv();
    if (server && key in server) {
        const v = server[key as keyof ServerEnv];
        return typeof v === "string" ? v : undefined;
    }
    if (typeof import.meta !== "undefined" && import.meta.env) {
        return (import.meta.env as Record<string, unknown>)[key] as string | undefined;
    }
    return undefined;
}
