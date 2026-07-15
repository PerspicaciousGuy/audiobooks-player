import { describe, expect, it } from "vitest";

import {
  decodeLibraryCursor,
  encodeLibraryCursor,
  updateAudiobookSchema,
} from "./contracts";

describe("library API contracts", () => {
  it("round-trips an opaque cursor", () => {
    const cursor = {
      id: "10000000-0000-4000-8000-000000000001",
      updatedAt: "2026-07-15T04:00:00.000Z",
    };

    expect(decodeLibraryCursor(encodeLibraryCursor(cursor))).toEqual(cursor);
  });

  it.each(["invalid", Buffer.from("{}").toString("base64url")])(
    "rejects malformed cursors",
    (cursor) => expect(decodeLibraryCursor(cursor)).toBeUndefined(),
  );

  it("requires at least one bounded metadata correction", () => {
    expect(updateAudiobookSchema.safeParse({}).success).toBe(false);
    expect(
      updateAudiobookSchema.safeParse({ title: "A revised title" }).success,
    ).toBe(true);
    expect(updateAudiobookSchema.safeParse({ title: "" }).success).toBe(false);
  });
});
