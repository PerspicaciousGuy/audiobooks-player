import { describe, expect, it } from "vitest";

import { parseId3Metadata } from "./id3";

function synchsafe(value: number): number[] {
  return [
    (value >> 21) & 0x7f,
    (value >> 14) & 0x7f,
    (value >> 7) & 0x7f,
    value & 0x7f,
  ];
}

function textFrame(id: string, value: string): Uint8Array {
  const text = new TextEncoder().encode(value);
  const body = Uint8Array.from([3, ...text]);
  return Uint8Array.from([
    ...new TextEncoder().encode(id),
    ...synchsafe(body.length),
    0,
    0,
    ...body,
  ]);
}

function chapterFrame(title: string): Uint8Array {
  const nestedTitle = textFrame("TIT2", title);
  const timing = new Uint8Array(16);
  const view = new DataView(timing.buffer);
  view.setUint32(0, 12_000);
  view.setUint32(4, 45_000);
  view.setUint32(8, 0xffffffff);
  view.setUint32(12, 0xffffffff);
  const body = Uint8Array.from([
    ...new TextEncoder().encode("chapter-1"),
    0,
    ...timing,
    ...nestedTitle,
  ]);
  return Uint8Array.from([
    ...new TextEncoder().encode("CHAP"),
    ...synchsafe(body.length),
    0,
    0,
    ...body,
  ]);
}

describe("ID3 metadata parser", () => {
  it("reads bounded ID3v2.4 text frames", () => {
    const frames = [
      textFrame("TIT2", "The Dispossessed"),
      textFrame("TPE1", "Ursula K. Le Guin"),
      textFrame("TPE3", "Don Leslie"),
    ];
    const body = Uint8Array.from(frames.flatMap((frame) => [...frame]));
    const tag = Uint8Array.from([
      73,
      68,
      51,
      4,
      0,
      0,
      ...synchsafe(body.length),
      ...body,
    ]);

    expect(parseId3Metadata(tag.buffer)).toEqual({
      author: "Ursula K. Le Guin",
      narrator: "Don Leslie",
      title: "The Dispossessed",
    });
  });

  it("returns no metadata for non-ID3 input", () => {
    expect(parseId3Metadata(new Uint8Array([1, 2, 3]).buffer)).toEqual({});
  });

  it("reads embedded chapter timing without reading audio bytes", () => {
    const frame = chapterFrame("The First Door");
    const tag = Uint8Array.from([
      73,
      68,
      51,
      4,
      0,
      0,
      ...synchsafe(frame.length),
      ...frame,
    ]);

    expect(parseId3Metadata(tag.buffer).chapters).toEqual([
      { endMs: 45_000, startMs: 12_000, title: "The First Door" },
    ]);
  });
});
