import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Auth (NextAuth.js v5)
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url(),

  // Database (PostgreSQL)
  DATABASE_URL: z.string().min(1),

  // Redis (Upstash) — optional in development
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // AI Providers
  ANTHROPIC_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),

  // Storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // OCR
  GOOGLE_CLOUD_VISION_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadConfig(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${formatted}\n\nCheck your .env file against .env.example`,
    );
  }

  return Object.freeze(parsed.data);
}

export const config = loadConfig();
