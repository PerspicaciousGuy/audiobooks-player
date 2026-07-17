"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  ImportPreviewGroup,
  ImportPreviewResponse,
} from "@/features/imports/contracts";
import type { SelectedDriveFolder } from "@/features/drive/contracts";
import {
  previewSelectedDriveFiles,
  selectAudiobooksFolder,
} from "@/features/imports/client";

import DrivePickerButton from "./DrivePickerButton";
import ImportReview from "./ImportReview";
import SelectedDriveFolderPanel from "./SelectedDriveFolderPanel";

interface DriveImportFlowProps {
  apiKey: string;
  initialFolder?: SelectedDriveFolder;
  projectNumber: string;
}

export default function DriveImportFlow({
  apiKey,
  initialFolder,
  projectNumber,
}: DriveImportFlowProps) {
  const router = useRouter();
  const [folder, setFolder] = useState(initialFolder);
  const [preview, setPreview] = useState<ImportPreviewResponse>();
  const [groups, setGroups] = useState<ImportPreviewGroup[]>([]);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string>();

  async function requestPreview(
    folderId: string,
    fileIds: string[],
  ): Promise<void> {
    const payload = await previewSelectedDriveFiles(folderId, fileIds);

    setPreview(payload);
    setGroups(payload.groups);
  }

  async function handleFolderPicked(
    pickedFolder: SelectedDriveFolder,
  ): Promise<void> {
    setIsWorking(true);
    setError(undefined);

    try {
      const selectedFolder = await selectAudiobooksFolder(pickedFolder.id);
      setFolder(selectedFolder);
      setPreview(undefined);
      setGroups([]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The Audiobooks folder could not be saved.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleFilesPicked(fileIds: string[]): Promise<void> {
    if (!folder) return;
    setIsWorking(true);
    setError(undefined);

    try {
      await requestPreview(folder.id, fileIds);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The selected audiobook files could not be reviewed.",
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
        detail?: string;
      };

      if (!response.ok || !payload.audiobookIds) {
        throw new Error(payload.detail ?? "The import could not be completed.");
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
      {folder ? <SelectedDriveFolderPanel folder={folder} /> : null}
      {folder ? (
        <DrivePickerButton
          apiKey={apiKey}
          disabled={isWorking}
          folder={folder}
          mode="files"
          onFilesPicked={handleFilesPicked}
          projectNumber={projectNumber}
        />
      ) : null}
      <DrivePickerButton
        apiKey={apiKey}
        disabled={isWorking}
        hasSelectedFolder={Boolean(folder)}
        mode="folder"
        onFolderPicked={handleFolderPicked}
        projectNumber={projectNumber}
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
      {preview &&
      groups.length === 0 &&
      preview.rejected.length === 0 &&
      preview.duplicateFileIds.length === 0 ? (
        <p className="border-border bg-paper-elevated rounded-control border p-4 text-sm">
          None of the selected files could be added. Review any file-specific
          messages above, then choose files again.
        </p>
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
