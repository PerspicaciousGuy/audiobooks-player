import "server-only";

import { z } from "zod";

const LOCAL_APP_URL = "http://localhost:3000";

const environmentSchema = z.object({
  appUrl: z.string().url(),
});

export const environment = environmentSchema.parse({
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? LOCAL_APP_URL,
});
