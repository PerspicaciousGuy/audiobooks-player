// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MOCK_AUDIOBOOKS } from "@/lib/mock/library";

import AudiobookMetadataEditor from "./AudiobookMetadataEditor";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

afterEach(() => {
  cleanup();
  refresh.mockReset();
  vi.restoreAllMocks();
});

describe("AudiobookMetadataEditor", () => {
  it("opens an accessible form and submits bounded corrections", async () => {
    const user = userEvent.setup();
    const audiobook = MOCK_AUDIOBOOKS[0];
    if (!audiobook) throw new Error("Mock audiobook is required.");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(audiobook), {
        headers: { "content-type": "application/json" },
      }),
    );
    const { container } = render(
      <AudiobookMetadataEditor audiobook={audiobook} />,
    );

    await user.click(screen.getByRole("button", { name: "Edit book details" }));
    const title = screen.getByRole("textbox", { name: "Title" });
    await user.clear(title);
    await user.type(title, "A corrected title");

    expect(
      (
        await axe.run(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);

    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/audiobooks/${audiobook.id}`,
      expect.objectContaining({
        body: expect.stringContaining("A corrected title"),
        method: "PATCH",
      }),
    );
    expect(await screen.findByText("Book details updated.")).toBeTruthy();
    expect(refresh).toHaveBeenCalledOnce();
  });
});
