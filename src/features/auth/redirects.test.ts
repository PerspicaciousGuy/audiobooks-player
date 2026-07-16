import { describe, expect, it } from "vitest";

import {
  createApplicationRedirectUrl,
  getSafeRedirectPath,
} from "@/features/auth/redirects";

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

  it("uses the configured application origin instead of a proxy origin", () => {
    const url = createApplicationRedirectUrl(
      "https://greasy-bethanne-ebooks-0926d76e.koyeb.app",
      "/app/onboarding?drive=connected",
    );

    expect(url.toString()).toBe(
      "https://greasy-bethanne-ebooks-0926d76e.koyeb.app/app/onboarding?drive=connected",
    );
  });

  it("cannot turn an external path into an application redirect", () => {
    const url = createApplicationRedirectUrl(
      "https://quiet.example",
      "https://attacker.example/collect",
    );

    expect(url.toString()).toBe("https://quiet.example/app");
  });
});
