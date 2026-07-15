export interface ParsedId3Metadata {
  album?: string;
  author?: string;
  chapters?: Array<{
    endMs?: number;
    startMs: number;
    title: string;
  }>;
  narrator?: string;
  title?: string;
}

function parseChapter(
  bytes: Uint8Array,
  version: number,
): NonNullable<ParsedId3Metadata["chapters"]>[number] | undefined {
  const identifierEnd = bytes.indexOf(0);

  if (identifierEnd < 0 || identifierEnd + 17 > bytes.length) return undefined;
  const identifier = new TextDecoder().decode(bytes.subarray(0, identifierEnd));
  const timing = new DataView(
    bytes.buffer,
    bytes.byteOffset + identifierEnd + 1,
    16,
  );
  const startMs = timing.getUint32(0);
  const endMs = timing.getUint32(4);
  let title = identifier || "Chapter";
  let offset = identifierEnd + 17;

  while (offset + 10 <= bytes.length) {
    const id = new TextDecoder("ascii").decode(
      bytes.subarray(offset, offset + 4),
    );
    const size = frameSize(bytes.subarray(offset + 4, offset + 8), version);
    const bodyStart = offset + 10;
    const bodyEnd = bodyStart + size;

    if (size <= 0 || bodyEnd > bytes.length) break;
    if (id === "TIT2")
      title = decodeText(bytes.subarray(bodyStart, bodyEnd)) ?? title;
    offset = bodyEnd;
  }

  return {
    ...(endMs !== 0xffffffff && endMs > startMs ? { endMs } : {}),
    startMs,
    title,
  };
}

function synchsafe(bytes: Uint8Array): number {
  return (
    ((bytes[0] ?? 0) << 21) |
    ((bytes[1] ?? 0) << 14) |
    ((bytes[2] ?? 0) << 7) |
    (bytes[3] ?? 0)
  );
}

function frameSize(bytes: Uint8Array, version: number): number {
  if (version === 4) {
    return synchsafe(bytes);
  }

  return new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0);
}

function swapUtf16ByteOrder(bytes: Uint8Array): Uint8Array {
  const swapped = new Uint8Array(bytes.length);

  for (let index = 0; index < bytes.length; index += 2) {
    swapped[index] = bytes[index + 1] ?? 0;
    swapped[index + 1] = bytes[index] ?? 0;
  }

  return swapped;
}

function decodeText(bytes: Uint8Array): string | undefined {
  const encoding = bytes[0];
  const content = bytes.subarray(1);
  let value: string;

  if (encoding === 0) {
    value = new TextDecoder("windows-1252").decode(content);
  } else if (encoding === 1 || encoding === 2) {
    const hasLittleEndianBom = content[0] === 0xff && content[1] === 0xfe;
    const start = content[0] === 0xfe || content[0] === 0xff ? 2 : 0;
    const normalized = hasLittleEndianBom
      ? content.subarray(start)
      : swapUtf16ByteOrder(content.subarray(start));
    value = new TextDecoder("utf-16le").decode(normalized);
  } else {
    value = new TextDecoder().decode(content);
  }

  const cleaned = value.replaceAll("\u0000", "").trim();
  return cleaned || undefined;
}

export function parseId3Metadata(buffer: ArrayBuffer): ParsedId3Metadata {
  const bytes = new Uint8Array(buffer);

  if (
    bytes.length < 10 ||
    String.fromCharCode(...bytes.subarray(0, 3)) !== "ID3"
  ) {
    return {};
  }

  const version = bytes[3] ?? 0;
  const tagEnd = Math.min(bytes.length, 10 + synchsafe(bytes.subarray(6, 10)));
  const metadata: ParsedId3Metadata = {};
  const chapters: NonNullable<ParsedId3Metadata["chapters"]> = [];
  let offset = 10;

  while (offset + 10 <= tagEnd) {
    const id = new TextDecoder("ascii").decode(
      bytes.subarray(offset, offset + 4),
    );

    if (!/^[A-Z0-9]{4}$/.test(id)) {
      break;
    }

    const size = frameSize(bytes.subarray(offset + 4, offset + 8), version);
    const bodyStart = offset + 10;
    const bodyEnd = bodyStart + size;

    if (size <= 0 || bodyEnd > tagEnd) {
      break;
    }

    const body = bytes.subarray(bodyStart, bodyEnd);
    const text = decodeText(body);

    if (id === "TIT2" && text) metadata.title = text;
    if (id === "TPE1" && text) metadata.author = text;
    if (id === "TPE3" && text) metadata.narrator = text;
    if (id === "TALB" && text) metadata.album = text;
    if (id === "CHAP") {
      const chapter = parseChapter(body, version);
      if (chapter) chapters.push(chapter);
    }
    offset = bodyEnd;
  }

  if (chapters.length > 0) metadata.chapters = chapters;

  return metadata;
}
