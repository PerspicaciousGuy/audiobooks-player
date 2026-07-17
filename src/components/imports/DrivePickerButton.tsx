"use client";

import { useState } from "react";

import {
  GOOGLE_DRIVE_FOLDER_MIME_TYPE,
  type SelectedDriveFolder,
} from "@/features/drive/contracts";

const PICKER_SCRIPT_ID = "google-picker-api";

interface DrivePickerButtonProps {
  apiKey: string;
  disabled?: boolean;
  hasSelectedFolder: boolean;
  onFolderPicked: (folder: SelectedDriveFolder) => Promise<void>;
  projectNumber: string;
}

function loadPickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const loadModule = () => {
      if (!window.gapi) {
        reject(new Error("Google API did not initialize."));
        return;
      }

      window.gapi.load("picker", resolve);
    };
    const existing = document.getElementById(PICKER_SCRIPT_ID);

    if (existing) {
      loadModule();
      return;
    }

    const script = document.createElement("script");
    script.id = PICKER_SCRIPT_ID;
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.onload = loadModule;
    script.onerror = () => reject(new Error("Google Picker could not load."));
    document.head.append(script);
  });
}

async function fetchPickerToken(): Promise<string> {
  const response = await fetch("/api/v1/drive/picker-token", {
    cache: "no-store",
  });
  const payload = (await response.json()) as {
    accessToken?: string;
    detail?: string;
  };

  if (!response.ok || !payload.accessToken) {
    throw new Error(payload.detail ?? "Drive must be reconnected.");
  }

  return payload.accessToken;
}

export default function DrivePickerButton({
  apiKey,
  disabled = false,
  hasSelectedFolder,
  onFolderPicked,
  projectNumber,
}: DrivePickerButtonProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string>();

  async function handleOpenPicker(): Promise<void> {
    setError(undefined);
    setIsOpening(true);

    try {
      const [accessToken] = await Promise.all([
        fetchPickerToken(),
        loadPickerApi(),
      ]);
      const pickerApi = window.google?.picker;

      if (!pickerApi) {
        throw new Error("Google Picker is unavailable.");
      }

      const view = new pickerApi.DocsView();
      view.setMimeTypes(GOOGLE_DRIVE_FOLDER_MIME_TYPE);
      view.setIncludeFolders(true);
      view.setSelectFolderEnabled(true);
      const picker = new pickerApi.PickerBuilder()
        .addView(view)
        .setAppId(projectNumber)
        .setOAuthToken(accessToken)
        .setDeveloperKey(apiKey)
        .setOrigin(window.location.origin)
        .setCallback((data) => {
          if (data.action !== pickerApi.Action.PICKED) return;
          const folder = data.docs?.[0];

          if (folder?.id && folder.name) {
            void onFolderPicked({ id: folder.id, name: folder.name });
          }
        })
        .build();
      picker.setVisible(true);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Google Picker failed.",
      );
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        className="bg-action text-paper-elevated hover:bg-action-strong focus-visible:ring-focus rounded-control min-h-12 px-5 font-semibold focus-visible:ring-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
        disabled={disabled || isOpening}
        onClick={() => void handleOpenPicker()}
        type="button"
      >
        {isOpening
          ? "Opening Google Picker…"
          : hasSelectedFolder
            ? "Change Audiobooks folder"
            : "Choose Audiobooks folder"}
      </button>
      {error ? (
        <p className="text-danger text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
