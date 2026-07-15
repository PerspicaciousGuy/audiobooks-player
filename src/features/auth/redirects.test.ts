import { describe, expect, it } from "vitest";

import { getSafeRedirectPath } from "@/features/auth/redirects";

describe("getSafeRedirectPath", () => {
  it("keeps an internal application path", () => {
    expect(getSafeRedirectPath("/app/library?state=empty")).toBe(
      "/app/library?state=empty",
    );
  });

  it("falls back when no path is provided", () => {
    expect(getSafeRedirectPath(undefined)).toBe("/app");
  });

  it("rejects an absolute external URL", () => {
    expect(getSafeRedirectPath("https://attacker.example/collect")).toBe(
      "/app",
    );
  });

  it("rejects a protocol-relative external URL", () => {
    expect(getSafeRedirectPath("//attacker.example/collect")).toBe("/app");
  });

  it("rejects a backslash path ambiguity", () => {
    expect(getSafeRedirectPath("/\\attacker.example/collect")).toBe("/app");
  });
});
