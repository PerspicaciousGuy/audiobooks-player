import { describe, expect, it } from "vitest";

import { formatBytes } from "./format";

describe("offline byte formatting", () => {
  it("formats storage values with binary units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatBytes(12 * 1024 * 1024)).toBe("12 MB");
  });
});
