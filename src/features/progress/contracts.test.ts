import { describe, expect, it } from "vitest";

import { progressCheckpointSchema, savedProgressSchema } from "./contracts";

const CHECKPOINT = {
  audiobookFileId: "20000000-0000-4000-8000-000000000002",
  chapterId: null,
  clientUpdatedAt: "2026-07-15T10:00:00.000Z",
  expectedVersion: 4,
  isCompleted: false,
  playbackRate: 1.25,
  positionMs: 90_000,
};

describe("progress contracts", () => {
  it("accepts a versioned client checkpoint", () => {
    expect(progressCheckpointSchema.parse(CHECKPOINT)).toEqual(CHECKPOINT);
  });

  it("rejects invalid positions, rates, and versions", () => {
    expect(
      progressCheckpointSchema.safeParse({ ...CHECKPOINT, positionMs: -1 })
        .success,
    ).toBe(false);
    expect(
      progressCheckpointSchema.safeParse({ ...CHECKPOINT, playbackRate: 4 })
        .success,
    ).toBe(false);
    expect(
      progressCheckpointSchema.safeParse({ ...CHECKPOINT, expectedVersion: 0 })
        .success,
    ).toBe(false);
  });

  it("coerces persisted numeric fields from Postgres responses", () => {
    const saved = savedProgressSchema.parse({
      ...CHECKPOINT,
      accepted: true,
      audiobookFileId: CHECKPOINT.audiobookFileId,
      playbackRate: "1.25",
      positionMs: "90000",
      version: "5",
    });

    expect(saved).toMatchObject({
      playbackRate: 1.25,
      positionMs: 90_000,
      version: 5,
    });
  });
});
