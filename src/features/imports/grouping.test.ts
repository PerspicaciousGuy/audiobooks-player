import { describe, expect, it } from "vitest";

import type { ValidatedDriveFile } from "./contracts";
import { groupValidatedDriveFiles } from "./grouping";

function file(name: string, title?: string): ValidatedDriveFile {
  return {
    byteSize: "1000",
    detected: title ? { album: title } : {},
    driveFileId: name.padEnd(12, "x").replaceAll(/[^A-Za-z0-9_-]/g, "x"),
    driveVersion: "1",
    md5Checksum: null,
    mimeType: "audio/mpeg",
    name,
  };
}

describe("Drive file grouping", () => {
  it("groups numbered parts and orders them naturally", () => {
    const groups = groupValidatedDriveFiles([
      file("A_Wizard_of_Earthsea Part 10.mp3"),
      file("A_Wizard_of_Earthsea Part 2.mp3"),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.title).toBe("A Wizard of Earthsea");
    expect(groups[0]?.files.map(({ name }) => name)).toEqual([
      "A_Wizard_of_Earthsea Part 2.mp3",
      "A_Wizard_of_Earthsea Part 10.mp3",
    ]);
  });

  it("uses detected album metadata as the grouping key", () => {
    const groups = groupValidatedDriveFiles([
      file("track-01.mp3", "Piranesi"),
      file("track-02.mp3", "Piranesi"),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.title).toBe("Piranesi");
  });
});
