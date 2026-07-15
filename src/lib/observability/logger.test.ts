import { afterEach, describe, expect, it, vi } from "vitest";

import { recordServerEvent } from "./logger";

afterEach(() => vi.restoreAllMocks());

describe("structured server events", () => {
  it("emits only allowlisted fields", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const unsafeFields = {
      operation: "account_delete",
      outcome: "success" as const,
      refreshToken: "must-not-appear",
      userId: "must-not-appear",
    };

    recordServerEvent("info", "account_deleted", unsafeFields);

    const output = String(info.mock.calls[0]?.[0]);
    expect(output).toContain('"event":"account_deleted"');
    expect(output).not.toContain("refreshToken");
    expect(output).not.toContain("userId");
    expect(output).not.toContain("must-not-appear");
  });
});
