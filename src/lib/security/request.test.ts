import { describe, expect, it } from "vitest";

import { isSameOriginMutation } from "./request";

describe("same-origin mutation checks", () => {
  it("accepts the configured application origin", () => {
    const request = new Request("https://listen.example/api", {
      headers: { origin: "https://listen.example" },
      method: "POST",
    });

    expect(isSameOriginMutation(request, "https://listen.example/app")).toBe(
      true,
    );
  });

  it.each([undefined, "https://attacker.example", "not-a-url"])(
    "rejects an untrusted origin: %s",
    (origin) => {
      const headers = origin ? { origin } : undefined;
      const request = new Request("https://listen.example/api", {
        ...(headers ? { headers } : {}),
        method: "POST",
      });

      expect(isSameOriginMutation(request, "https://listen.example")).toBe(
        false,
      );
    },
  );
});
