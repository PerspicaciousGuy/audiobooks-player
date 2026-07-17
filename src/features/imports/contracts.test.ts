import { describe, expect, it } from "vitest";

import {
  confirmImportSchema,
  importPreviewSourceSchema,
  selectedDriveFilesSchema,
} from "./contracts";

const FILE_ID = "drive-file-id-0001";

describe("import API contracts", () => {
  it("rejects repeated Picker file IDs", () => {
    expect(
      selectedDriveFilesSchema.safeParse({
        fileIds: [FILE_ID, FILE_ID],
        folderId: "audiobooks-folder-id",
      }).success,
    ).toBe(false);
  });

  it("accepts explicitly selected files from the Audiobooks folder", () => {
    expect(
      importPreviewSourceSchema.safeParse({
        fileIds: [FILE_ID],
        folderId: "audiobooks-folder-id",
      }).success,
    ).toBe(true);
  });

  it("does not accept a folder scan without explicit file selection", () => {
    expect(
      importPreviewSourceSchema.safeParse({
        folderId: "audiobooks-folder-id",
      }).success,
    ).toBe(false);
  });

  it("accepts reviewed metadata without trusting file metadata", () => {
    const parsed = confirmImportSchema.parse({
      groups: [
        {
          author: "Ursula K. Le Guin",
          fileIds: [FILE_ID],
          narrator: "Rob Inglis",
          series: "Earthsea",
          seriesPosition: 1,
          title: "A Wizard of Earthsea",
        },
      ],
    });

    expect(parsed.groups[0]?.title).toBe("A Wizard of Earthsea");
    expect(parsed.groups[0]).not.toHaveProperty("mimeType");
  });

  it("rejects assigning one file to multiple groups", () => {
    expect(
      confirmImportSchema.safeParse({
        groups: [
          { fileIds: [FILE_ID], title: "Book one" },
          { fileIds: [FILE_ID], title: "Book two" },
        ],
      }).success,
    ).toBe(false);
  });
});
