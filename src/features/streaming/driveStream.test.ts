import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getValidDriveCredentials } from "@/features/drive/access";

import { openDriveDownloadStream, openDriveRangeStream } from "./driveStream";

vi.mock("@/features/drive/access", () => ({
  getValidDriveCredentials: vi.fn(),
}));

const FILE = {
  byteSize: 10_000,
  driveFileId: "drive/source id",
  driveVersion: "4",
  fileName: "book.mp3",
  id: "20000000-0000-4000-8000-000000000002",
  mimeType: "audio/mpeg",
};
const RANGE = {
  end: 99,
  header: "bytes=0-99",
  length: 100,
  start: 0,
};

beforeEach(() => vi.clearAllMocks());

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Drive streaming", () => {
  it("forwards one owned bounded range without buffering the body", async () => {
    vi.mocked(getValidDriveCredentials).mockResolvedValue({
      accessToken: "access-token",
      expiresAt: "2026-07-15T11:00:00.000Z",
      refreshToken: "refresh-token",
      scope: ["https://www.googleapis.com/auth/drive.file"],
      tokenType: "Bearer",
    });
    const upstream = new Response("audio", { status: 206 });
    const fetchMock = vi.fn().mockResolvedValue(upstream);
    vi.stubGlobal("fetch", fetchMock);

    const response = await openDriveRangeStream(
      "user-id",
      FILE,
      RANGE,
      new AbortController().signal,
    );

    expect(response).toBe(upstream);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("files/drive%2Fsource%20id");
    expect(init.headers).toEqual({
      authorization: "Bearer access-token",
      range: "bytes=0-99",
    });
  });

  it("refreshes once and retries when Drive rejects the access token", async () => {
    vi.mocked(getValidDriveCredentials)
      .mockResolvedValueOnce({
        accessToken: "expired-token",
        expiresAt: "2026-07-15T09:00:00.000Z",
        refreshToken: "refresh-token",
        scope: ["https://www.googleapis.com/auth/drive.file"],
        tokenType: "Bearer",
      })
      .mockResolvedValueOnce({
        accessToken: "refreshed-token",
        expiresAt: "2026-07-15T11:00:00.000Z",
        refreshToken: "refresh-token",
        scope: ["https://www.googleapis.com/auth/drive.file"],
        tokenType: "Bearer",
      });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("denied", { status: 401 }))
      .mockResolvedValueOnce(new Response("audio", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await openDriveDownloadStream(
      "user-id",
      FILE,
      new AbortController().signal,
    );

    expect(response.status).toBe(200);
    expect(getValidDriveCredentials).toHaveBeenNthCalledWith(
      2,
      "user-id",
      true,
    );
    const [, retry] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(retry.headers).toEqual({
      authorization: "Bearer refreshed-token",
    });
  });
});
