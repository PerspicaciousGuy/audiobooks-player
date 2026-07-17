import { afterEach, describe, expect, it, vi } from "vitest";

import { GOOGLE_DRIVE_FOLDER_MIME_TYPE } from "./contracts";
import {
  listAudiobooksFolderFileIds,
  validateAudiobooksFolder,
} from "./folders";

const ACCESS_TOKEN = "access-token";
const ROOT_FOLDER_ID = "root-folder-id";

function driveChild(id: string, name: string, mimeType: string) {
  return { id, mimeType, name };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Audiobooks Drive folder", () => {
  it("accepts an accessible folder named Audiobooks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          id: ROOT_FOLDER_ID,
          mimeType: GOOGLE_DRIVE_FOLDER_MIME_TYPE,
          name: "Audiobooks",
          trashed: false,
        }),
      ),
    );

    await expect(
      validateAudiobooksFolder(ROOT_FOLDER_ID, ACCESS_TOKEN),
    ).resolves.toEqual({ id: ROOT_FOLDER_ID, name: "Audiobooks" });
  });

  it("rejects a selected folder with a different name", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          id: ROOT_FOLDER_ID,
          mimeType: GOOGLE_DRIVE_FOLDER_MIME_TYPE,
          name: "Books",
          trashed: false,
        }),
      ),
    );

    await expect(
      validateAudiobooksFolder(ROOT_FOLDER_ID, ACCESS_TOKEN),
    ).rejects.toThrow("Choose a Google Drive folder named Audiobooks.");
  });

  it("returns supported audio from nested folders", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          files: [
            driveChild(
              "nested-folder-id",
              "Book one",
              GOOGLE_DRIVE_FOLDER_MIME_TYPE,
            ),
            driveChild("audio-file-one", "Chapter 1.mp3", "audio/mpeg"),
            driveChild("notes-file-id", "notes.txt", "text/plain"),
          ],
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          files: [driveChild("audio-file-two", "Chapter 2.m4b", "audio/mp4")],
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      listAudiobooksFolderFileIds(ROOT_FOLDER_ID, ACCESS_TOKEN),
    ).resolves.toEqual(["audio-file-one", "audio-file-two"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("stops scans that exceed the import file limit", async () => {
    const files = Array.from({ length: 26 }, (_, index) =>
      driveChild(`audio-file-${index}`, `Chapter ${index}.mp3`, "audio/mpeg"),
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ files })));

    await expect(
      listAudiobooksFolderFileIds(ROOT_FOLDER_ID, ACCESS_TOKEN),
    ).rejects.toThrow("Import supports up to 25 audio files at a time.");
  });
});
