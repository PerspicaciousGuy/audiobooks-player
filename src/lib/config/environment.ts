import "server-only";

import { z } from "zod";

const LOCAL_APP_URL = "http://localhost:3000";

const environmentSchema = z
  .object({
    appUrl: z.string().url(),
    authMode: z.enum(["preview", "supabase"]),
    databaseUrl: z.string().min(1).optional(),
    driveIntegrationMode: z.enum(["disabled", "google"]),
    driveTokenEncryptionKey: z.string().min(1).optional(),
    googleDriveClientId: z.string().min(1).optional(),
    googleDriveClientSecret: z.string().min(1).optional(),
    supabasePublishableKey: z.string().min(1).optional(),
    supabaseSecretKey: z.string().min(1).optional(),
    supabaseUrl: z.string().url().optional(),
  })
  .superRefine((value, context) => {
    if (value.authMode === "supabase") {
      const requiredSupabaseValues = [
        ["supabaseUrl", value.supabaseUrl],
        ["supabasePublishableKey", value.supabasePublishableKey],
        ["supabaseSecretKey", value.supabaseSecretKey],
      ] as const;

      requiredSupabaseValues.forEach(([path, requiredValue]) => {
        if (!requiredValue) {
          context.addIssue({
            code: "custom",
            message: `${path} is required when auth mode is supabase`,
            path: [path],
          });
        }
      });
    }

    if (value.driveIntegrationMode === "google") {
      const requiredDriveValues = [
        ["googleDriveClientId", value.googleDriveClientId],
        ["googleDriveClientSecret", value.googleDriveClientSecret],
        ["driveTokenEncryptionKey", value.driveTokenEncryptionKey],
      ] as const;

      requiredDriveValues.forEach(([path, requiredValue]) => {
        if (!requiredValue) {
          context.addIssue({
            code: "custom",
            message: `${path} is required when Drive integration is enabled`,
            path: [path],
          });
        }
      });
    }
  });

export const environment = environmentSchema.parse({
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? LOCAL_APP_URL,
  authMode: process.env.NEXT_PUBLIC_AUTH_MODE ?? "preview",
  databaseUrl: process.env.DATABASE_URL || undefined,
  driveIntegrationMode: process.env.DRIVE_INTEGRATION_MODE ?? "disabled",
  driveTokenEncryptionKey: process.env.DRIVE_TOKEN_ENCRYPTION_KEY || undefined,
  googleDriveClientId: process.env.GOOGLE_DRIVE_CLIENT_ID || undefined,
  googleDriveClientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || undefined,
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || undefined,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
});

export function isSupabaseAuthEnabled(): boolean {
  return environment.authMode === "supabase";
}

export interface SupabaseRuntimeConfig {
  publishableKey: string;
  secretKey: string;
  url: string;
}

export function getSupabaseRuntimeConfig(): SupabaseRuntimeConfig | undefined {
  if (!isSupabaseAuthEnabled()) {
    return undefined;
  }

  if (
    !environment.supabaseUrl ||
    !environment.supabasePublishableKey ||
    !environment.supabaseSecretKey
  ) {
    throw new Error("Supabase configuration was not validated.");
  }

  return {
    publishableKey: environment.supabasePublishableKey,
    secretKey: environment.supabaseSecretKey,
    url: environment.supabaseUrl,
  };
}
