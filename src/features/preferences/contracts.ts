import { z } from "zod";

const playbackRates = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const skipIntervals = [5, 10, 15, 30, 45, 60] as const;
const sleepTimers = [15, 30, 60] as const;

export const userPreferencesSchema = z.object({
  defaultPlaybackRate: z
    .number()
    .refine((value) => playbackRates.some((rate) => rate === value)),
  defaultSleepTimerMinutes: z
    .number()
    .nullable()
    .refine(
      (value) =>
        value === null || sleepTimers.some((minutes) => minutes === value),
    ),
  skipBackSeconds: z
    .number()
    .refine((value) => skipIntervals.some((seconds) => seconds === value)),
  skipForwardSeconds: z
    .number()
    .refine((value) => skipIntervals.some((seconds) => seconds === value)),
  theme: z.enum(["dark", "light", "system"]),
});

export const userPreferencesRowSchema = z.object({
  default_playback_rate: z.coerce.number(),
  default_sleep_timer_minutes: z.number().nullable(),
  skip_back_seconds: z.number(),
  skip_forward_seconds: z.number(),
  theme: z.enum(["dark", "light", "system"]),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultPlaybackRate: 1,
  defaultSleepTimerMinutes: null,
  skipBackSeconds: 15,
  skipForwardSeconds: 30,
  theme: "system",
};
