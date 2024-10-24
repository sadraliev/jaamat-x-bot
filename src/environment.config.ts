import { z } from 'zod';

const envSchema = z.object({
  BOT_TOKEN: z.string().regex(/^\d{6}:[A-Za-z0-9_-]+$/, {
    message: "Invalid BOT_TOKEN format. It should be '<number>:<alphanumeric>'",
  }),
  HOST_URL: z.string().url({ message: 'HOST_URL must be a valid URL' }),
  APPWRITE_FUNCTION_API_ENDPOINT: z.string().url({
    message: 'APPWRITE_FUNCTION_API_ENDPOINT must be a valid URL',
  }),
  APPWRITE_FUNCTION_PROJECT_ID: z.string().length(20, {
    message: 'APPWRITE_FUNCTION_PROJECT_ID must be a string of 20 digits',
  }),
});

export type EnvConfig = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvConfig {}
  }
}
