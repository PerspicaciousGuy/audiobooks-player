import { describe, expect, it } from "vitest";

import { DEFAULT_USER_PREFERENCES, userPreferencesSchema } from "./contracts";

describe("user preference contracts", () => {
  it("accepts supported synchronized preferences", () => {
    expect(userPreferencesSchema.parse(DEFAULT_USER_PREFERENCES)).toEqual(
      DEFAULT_USER_PREFERENCES,
    );
  });

  it.each([
    { defaultPlaybackRate: 4 },
    { defaultSleepTimerMinutes: 17 },
    { skipBackSeconds: 1 },
    { skipForwardSeconds: 600 },
    { theme: "sepia" },
  ])("rejects an unsupported value: %o", (change) => {
    expect(
      userPreferencesSchema.safeParse({
        ...DEFAULT_USER_PREFERENCES,
        ...change,
      }).success,
    ).toBe(false);
  });
});
