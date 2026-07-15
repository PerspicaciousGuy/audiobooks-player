// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_USER_PREFERENCES } from "@/features/preferences/contracts";

import PreferencesForm from "./PreferencesForm";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  refresh.mockReset();
});

describe("PreferencesForm", () => {
  it("is accessible and clearly disables persistence in preview mode", async () => {
    const { container } = render(
      <PreferencesForm
        canPersist={false}
        initialPreferences={DEFAULT_USER_PREFERENCES}
      />,
    );
    const button = screen.getByRole("button", {
      name: "Preview only",
    }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(
      (
        await axe.run(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
  });

  it("saves changed values and refreshes the server layout", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(DEFAULT_USER_PREFERENCES), {
        headers: { "content-type": "application/json" },
      }),
    );
    render(
      <PreferencesForm
        canPersist
        initialPreferences={DEFAULT_USER_PREFERENCES}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Color theme" }),
      "dark",
    );
    await user.click(screen.getByRole("button", { name: "Save preferences" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/preferences",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(
      await screen.findByText("Preferences saved across your account."),
    ).toBeTruthy();
    expect(refresh).toHaveBeenCalledOnce();
  });
});
