// @vitest-environment jsdom

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";

import AccountDeletionControl from "./AccountDeletionControl";

vi.mock("@/features/offline/downloads", () => ({
  clearOfflineDownloads: vi.fn(),
}));

describe("AccountDeletionControl", () => {
  it("has no detectable accessibility violations before and after confirmation", async () => {
    const user = userEvent.setup();
    const { container, getByRole } = render(<AccountDeletionControl />);
    const runAxe = () =>
      axe.run(container, {
        rules: { "color-contrast": { enabled: false } },
      });

    expect((await runAxe()).violations).toEqual([]);

    await user.click(getByRole("button", { name: "Delete account" }));

    expect((await runAxe()).violations).toEqual([]);
    const confirmButton = getByRole("button", {
      name: "Delete permanently",
    }) as HTMLButtonElement;
    expect(confirmButton.disabled).toBe(true);
  });
});
