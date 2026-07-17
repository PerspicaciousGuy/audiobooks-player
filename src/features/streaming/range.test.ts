import { describe, expect, it } from "vitest";

import { MAX_STREAM_CHUNK_BYTES, parseBoundedRange } from "./range";

describe("bounded HTTP ranges", () => {
  it("creates a bounded initial range when the browser omits one", () => {
    expect(parseBoundedRange(null, 10_000_000)).toEqual({
      end: MAX_STREAM_CHUNK_BYTES - 1,
      header: `bytes=0-${MAX_STREAM_CHUNK_BYTES - 1}`,
      length: MAX_STREAM_CHUNK_BYTES,
      start: 0,
    });
  });

  it("preserves an open-ended media range and supports suffix ranges", () => {
    expect(parseBoundedRange("bytes=100-", 10_000_000)).toEqual({
      end: 9_999_999,
      header: "bytes=100-9999999",
      length: 9_999_900,
      start: 100,
    });
    expect(parseBoundedRange("bytes=-500", 1_000)).toEqual({
      end: 999,
      header: "bytes=500-999",
      length: 500,
      start: 500,
    });
  });

  it("rejects multiple, reversed, and unsatisfiable ranges", () => {
    expect(parseBoundedRange("bytes=0-1,4-5", 100)).toBeUndefined();
    expect(parseBoundedRange("bytes=50-20", 100)).toBeUndefined();
    expect(parseBoundedRange("bytes=100-", 100)).toBeUndefined();
  });
});
