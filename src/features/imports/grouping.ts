import type { ImportPreviewGroup, ValidatedDriveFile } from "./contracts";

const PART_SUFFIX =
  /(?:[\s._-]+(?:part|pt|disc|disk|cd|chapter|ch)[\s._-]*\d+)$/i;

function withoutExtension(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

function cleanTitle(name: string): string {
  return withoutExtension(name)
    .replace(PART_SUFFIX, "")
    .replaceAll(/[._]+/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function groupKey(file: ValidatedDriveFile): string {
  return (file.detected.album ?? file.detected.title ?? cleanTitle(file.name))
    .toLocaleLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-");
}

export function groupValidatedDriveFiles(
  files: ValidatedDriveFile[],
): ImportPreviewGroup[] {
  const groups = new Map<string, ValidatedDriveFile[]>();

  files.forEach((file) => {
    const key = groupKey(file);
    groups.set(key, [...(groups.get(key) ?? []), file]);
  });

  return [...groups.values()].map((groupFiles) => {
    const sortedFiles = groupFiles.toSorted((left, right) =>
      left.name.localeCompare(right.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
    const first = sortedFiles[0];

    return {
      author: first?.detected.author ?? "",
      files: sortedFiles,
      narrator: first?.detected.narrator ?? "",
      series: "",
      seriesPosition: null,
      title:
        first?.detected.album ??
        first?.detected.title ??
        (first ? cleanTitle(first.name) : "Untitled audiobook"),
    };
  });
}
