import { describe, expect, it } from "vitest";

import { parseSingleRange } from "./range";

describe("single HTTP ranges", () => {
  it("preserves an open-ended media range and supports suffix ranges", () => {
    expect(parseSingleRange("bytes=100-", 10_000_000)).toEqual({
      end: 9_999_999,
      header: "bytes=100-9999999",
      length: 9_999_900,
      start: 100,
    });
    expect(parseSingleRange("bytes=-500", 1_000)).toEqual({
      end: 999,
      header: "bytes=500-999",
      length: 500,
      start: 500,
    });
  });

  it("preserves an explicitly requested range larger than four MiB", () => {
    expect(parseSingleRange("bytes=0-8999999", 10_000_000)).toEqual({
      end: 8_999_999,
      header: "bytes=0-8999999",
      length: 9_000_000,
      start: 0,
    });
  });

  it("rejects multiple, reversed, and unsatisfiable ranges", () => {
    expect(parseSingleRange("bytes=0-1,4-5", 100)).toBeUndefined();
    expect(parseSingleRange("bytes=50-20", 100)).toBeUndefined();
    expect(parseSingleRange("bytes=100-", 100)).toBeUndefined();
  });
});
