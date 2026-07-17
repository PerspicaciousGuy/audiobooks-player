export interface ByteRange {
  end: number;
  header: string;
  length: number;
  start: number;
}

export function parseSingleRange(
  rangeHeader: string,
  fileSize: number,
): ByteRange | undefined {
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) return undefined;

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
    const length = Math.min(suffixLength, fileSize);
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

  const end = Math.min(requestedEnd, fileSize - 1);
  return {
    end,
    header: `bytes=${start}-${end}`,
    length: end - start + 1,
    start,
  };
}
