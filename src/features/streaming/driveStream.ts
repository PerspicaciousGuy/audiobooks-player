import "server-only";

import { getValidDriveCredentials } from "@/features/drive/access";

import type { ByteRange } from "./range";
import type { OwnedStreamFile } from "./repository";

function mediaUrl(driveFileId: string): string {
  const url = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(driveFileId)}`,
  );
  url.searchParams.set("alt", "media");
  url.searchParams.set("supportsAllDrives", "true");
  return url.toString();
}

async function requestDriveRange(
  file: OwnedStreamFile,
  range: ByteRange,
  accessToken: string,
  requestSignal: AbortSignal,
): Promise<Response> {
  return fetch(mediaUrl(file.driveFileId), {
    cache: "no-store",
    headers: {
      authorization: `Bearer ${accessToken}`,
      range: range.header,
    },
    signal: AbortSignal.any([requestSignal, AbortSignal.timeout(20_000)]),
  });
}

export async function openDriveRangeStream(
  userId: string,
  file: OwnedStreamFile,
  range: ByteRange,
  requestSignal: AbortSignal,
): Promise<Response> {
  let credentials = await getValidDriveCredentials(userId);
  let response = await requestDriveRange(
    file,
    range,
    credentials.accessToken,
    requestSignal,
  );

  if (response.status === 401) {
    await response.body?.cancel();
    credentials = await getValidDriveCredentials(userId, true);
    response = await requestDriveRange(
      file,
      range,
      credentials.accessToken,
      requestSignal,
    );
  }

  return response;
}

async function requestDriveDownload(
  file: OwnedStreamFile,
  accessToken: string,
  requestSignal: AbortSignal,
): Promise<Response> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), 15_000);

  try {
    return await fetch(mediaUrl(file.driveFileId), {
      cache: "no-store",
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.any([requestSignal, timeoutController.signal]),
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function openDriveDownloadStream(
  userId: string,
  file: OwnedStreamFile,
  requestSignal: AbortSignal,
): Promise<Response> {
  let credentials = await getValidDriveCredentials(userId);
  let response = await requestDriveDownload(
    file,
    credentials.accessToken,
    requestSignal,
  );

  if (response.status === 401) {
    await response.body?.cancel();
    credentials = await getValidDriveCredentials(userId, true);
    response = await requestDriveDownload(
      file,
      credentials.accessToken,
      requestSignal,
    );
  }

  return response;
}
