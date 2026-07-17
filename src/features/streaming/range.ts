export const MAX_STREAM_CHUNK_BYTES = 4 * 1024 * 1024;

export interface ByteRange {
  end: number;
  header: string;
  length: number;
  start: number;
}

export function parseBoundedRange(
  rangeHeader: string | null,
  fileSize: number,
): ByteRange | undefined {
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) return undefined;

  if (!rangeHeader) {
    const end = Math.min(fileSize - 1, MAX_STREAM_CHUNK_BYTES - 1);
    return { end, header: `bytes=0-${end}`, length: end + 1, start: 0 };
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());

  if (!match || (!match[1] && !match[2])) return undefined;
  const startText = match[1];
  const endText = match[2];
  let start: number;
  let requestedEnd: number;

  if (!startText && endText) {
    const suffixLength = Number(endText);
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0)
      return undefined;
    const length = Math.min(suffixLength, MAX_STREAM_CHUNK_BYTES, fileSize);
    start = fileSize - length;
    requestedEnd = fileSize - 1;
  } else {
    start = Number(startText);
    requestedEnd = endText ? Number(endText) : fileSize - 1;
  }

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(requestedEnd) ||
    start < 0 ||
    start >= fileSize ||
    requestedEnd < start
  ) {
    return undefined;
  }

  const end = Math.min(
    requestedEnd,
    fileSize - 1,
    endText ? start + MAX_STREAM_CHUNK_BYTES - 1 : fileSize - 1,
  );
  return {
    end,
    header: `bytes=${start}-${end}`,
    length: end - start + 1,
    start,
  };
}
