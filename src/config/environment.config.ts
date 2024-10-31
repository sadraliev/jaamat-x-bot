import { z } from 'zod';

export const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  PORT: z.string().default('3000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvConfig {}
  }
}

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('Environment variable validation error:', env.error.format());
  process.exit(1);
}
