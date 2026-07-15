"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  ImportPreviewGroup,
  ImportPreviewResponse,
} from "@/features/imports/contracts";

import DrivePickerButton from "./DrivePickerButton";
import ImportReview from "./ImportReview";

interface DriveImportFlowProps {
  apiKey: string;
}

export default function DriveImportFlow({ apiKey }: DriveImportFlowProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<ImportPreviewResponse>();
  const [groups, setGroups] = useState<ImportPreviewGroup[]>([]);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string>();

  async function handleFilesPicked(fileIds: string[]): Promise<void> {
    setIsWorking(true);
    setError(undefined);

    try {
      const response = await fetch("/api/v1/imports/preview", {
        body: JSON.stringify({ fileIds }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as ImportPreviewResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? "The selected files could not be reviewed.",
        );
      }

      setPreview(payload);
      setGroups(payload.groups);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The selected files could not be reviewed.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleImport(): Promise<void> {
    setIsWorking(true);
    setError(undefined);

    try {
      const response = await fetch("/api/v1/imports", {
        body: JSON.stringify({
          groups: groups.map((group) => ({
            author: group.author,
            fileIds: group.files.map(({ driveFileId }) => driveFileId),
            narrator: group.narrator,
            series: group.series,
            seriesPosition: group.seriesPosition,
            title: group.title,
          })),
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as {
        audiobookIds?: string[];
        error?: string;
      };

      if (!response.ok || !payload.audiobookIds) {
        throw new Error(payload.error ?? "The import could not be completed.");
      }

      router.push(`/app/library?imported=${payload.audiobookIds.length}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The import could not be completed.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <DrivePickerButton
        apiKey={apiKey}
        disabled={isWorking}
        onFilesPicked={handleFilesPicked}
      />
      {isWorking && !preview ? (
        <p className="text-ink-muted text-sm" role="status">
          Validating file access and reading bounded metadata…
        </p>
      ) : null}
      {error ? (
        <p className="text-danger text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {preview?.duplicateFileIds.length ? (
        <p className="bg-action-soft rounded-control p-4 text-sm" role="status">
          {preview.duplicateFileIds.length} already-imported file
          {preview.duplicateFileIds.length === 1 ? " was" : "s were"} skipped.
        </p>
      ) : null}
      {preview?.rejected.length ? (
        <section className="border-danger/35 bg-danger/5 rounded-card border p-4">
          <h2 className="font-semibold">Files that need attention</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm">
            {preview.rejected.map((file) => (
              <li key={file.driveFileId}>
                {file.name ?? file.driveFileId}: {file.reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {groups.length > 0 ? (
        <ImportReview
          groups={groups}
          isSubmitting={isWorking}
          onChange={setGroups}
          onSubmit={handleImport}
        />
      ) : null}
    </div>
  );
}
