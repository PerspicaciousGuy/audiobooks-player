import { describe, expect, it } from "vitest";

import { problemResponse } from "./problem";

describe("problemResponse", () => {
  it("returns an RFC 9457 response with safe cache headers", async () => {
    const response = problemResponse("Authentication required.", 401);

    expect(response.status).toBe(401);
    expect(response.headers.get("content-type")).toBe(
      "application/problem+json",
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      detail: "Authentication required.",
      status: 401,
      title: "Unauthorized",
      type: "about:blank",
    });
  });

  it("preserves rate-limit headers and safe extensions", async () => {
    const response = problemResponse("Try again later.", 429, {
      extensions: { code: "quota_exceeded" },
      headers: { "retry-after": "30" },
    });

    expect(response.headers.get("retry-after")).toBe("30");
    await expect(response.json()).resolves.toMatchObject({
      code: "quota_exceeded",
      status: 429,
    });
  });
});
