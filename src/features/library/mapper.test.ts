import { describe, expect, it } from "vitest";

import { progressRowSchema } from "./mapper";

describe("library row mapping contracts", () => {
  it("accepts the offset timestamp returned by Postgres", () => {
    const progress = progressRowSchema.parse({
      audiobook_file_id: "20000000-0000-4000-8000-000000000002",
      audiobook_id: "10000000-0000-4000-8000-000000000001",
      chapter_id: null,
      client_updated_at: "2026-07-17T03:36:52.798+00:00",
      is_completed: false,
      playback_rate: "1.25",
      position_ms: 10_000,
      version: "22",
    });

    expect(progress).toMatchObject({
      client_updated_at: "2026-07-17T03:36:52.798+00:00",
      playback_rate: 1.25,
      version: 22,
    });
  });
});
