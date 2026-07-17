import { afterEach, describe, expect, it, vi } from "vitest";

import { isValidatedDriveFile, validateDriveFile } from "./driveFiles";

const FILE_ID = "drive-file-id";
const ACCESS_TOKEN = "access-token";

function metadata(overrides: Record<string, unknown> = {}) {
  return {
    capabilities: { canDownload: true },
    id: FILE_ID,
    md5Checksum: "checksum",
    mimeType: "audio/mpeg",
    name: "A Wizard of Earthsea.mp3",
    parents: ["audiobooks-folder-id"],
    size: "1024",
    trashed: false,
    version: "7",
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Drive file validation", () => {
  it("rejects files the user cannot download", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json(metadata({ capabilities: { canDownload: false } })),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await validateDriveFile(FILE_ID, ACCESS_TOKEN);

    expect(result).toMatchObject({
      driveFileId: FILE_ID,
      name: "A Wizard of Earthsea.mp3",
      reason: "Google Drive does not allow this file to be downloaded.",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("accepts supported metadata and bounds the MP3 metadata request", async () => {
    const id3Header = Uint8Array.from([73, 68, 51, 4, 0, 0, 0, 0, 0, 0]);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(metadata()))
      .mockResolvedValueOnce(
        new Response(id3Header, {
          headers: { "content-length": String(id3Header.byteLength) },
          status: 206,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await validateDriveFile(FILE_ID, ACCESS_TOKEN);

    expect(isValidatedDriveFile(result)).toBe(true);
    expect(result).toMatchObject({
      byteSize: "1024",
      driveFileId: FILE_ID,
      driveVersion: "7",
      mimeType: "audio/mpeg",
      name: "A Wizard of Earthsea.mp3",
    });
    const [, metadataRequest] = fetchMock.mock.calls[1] as [
      string,
      RequestInit,
    ];
    expect(metadataRequest.headers).toMatchObject({
      authorization: `Bearer ${ACCESS_TOKEN}`,
      range: "bytes=0-1048575",
    });
  });

  it("rejects malformed Drive metadata without trusting partial fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ id: FILE_ID })),
    );

    await expect(validateDriveFile(FILE_ID, ACCESS_TOKEN)).resolves.toEqual({
      driveFileId: FILE_ID,
      reason: "Drive metadata was incomplete.",
    });
  });

  it.each(["audio/m4b", "application/mp4", "application/x-m4b", "video/mp4"])(
    "accepts an M4B file reported as %s",
    async (mimeType) => {
      const fetchMock = vi.fn().mockResolvedValue(
        Response.json(
          metadata({
            mimeType,
            name: "The Left Hand of Darkness.m4b",
          }),
        ),
      );
      vi.stubGlobal("fetch", fetchMock);

      const result = await validateDriveFile(FILE_ID, ACCESS_TOKEN);

      expect(isValidatedDriveFile(result)).toBe(true);
      expect(result).toMatchObject({ mimeType: "audio/mp4" });
      expect(fetchMock).toHaveBeenCalledOnce();
    },
  );

  it("rejects a video MIME type on a non-MP4 audio extension", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(Response.json(metadata({ mimeType: "video/mp4" }))),
    );

    await expect(
      validateDriveFile(FILE_ID, ACCESS_TOKEN),
    ).resolves.toMatchObject({
      reason: "The file type reported by Google Drive is not supported.",
    });
  });

  it("rejects a file outside the selected Audiobooks folder", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json(metadata())),
    );

    await expect(
      validateDriveFile(FILE_ID, ACCESS_TOKEN, "another-folder-id"),
    ).resolves.toMatchObject({
      reason: "The file is not directly inside the selected Audiobooks folder.",
    });
  });
});
