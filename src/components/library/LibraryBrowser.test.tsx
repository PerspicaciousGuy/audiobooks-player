// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MOCK_AUDIOBOOKS } from "@/lib/mock/library";

import LibraryBrowser from "./LibraryBrowser";

vi.mock("@/features/offline/downloads", () => ({
  listOfflineDownloads: vi
    .fn()
    .mockResolvedValue([{ audiobookId: "piranesi" }]),
}));

describe("LibraryBrowser", () => {
  it("searches metadata and applies progress/device filters", async () => {
    const user = userEvent.setup();
    render(<LibraryBrowser audiobooks={[...MOCK_AUDIOBOOKS]} />);

    await user.type(
      screen.getByRole("searchbox", { name: "Search your library" }),
      "Le Guin",
    );
    expect(
      screen.getByRole("link", { name: "The Left Hand of Darkness" }),
    ).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Piranesi" })).toBeNull();

    await user.clear(screen.getByRole("searchbox"));
    await user.click(screen.getByRole("button", { name: "Finished" }));
    expect(
      screen.getByRole("link", { name: "Sea of Tranquility" }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Downloaded" }));
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Piranesi" })).toBeTruthy(),
    );
  });
});
