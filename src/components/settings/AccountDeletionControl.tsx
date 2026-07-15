"use client";

import { useState } from "react";

import { clearOfflineDownloads } from "@/features/offline/downloads";

const CONFIRMATION = "DELETE";

export default function AccountDeletionControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteAccount() {
    if (confirmation !== CONFIRMATION) return;

    setIsDeleting(true);
    setMessage(undefined);

    try {
      const response = await fetch("/api/v1/account", { method: "DELETE" });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Account deletion failed.");
      }

      await clearOfflineDownloads().catch(() => undefined);
      window.location.replace("/");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Account deletion could not be completed.",
      );
      setIsDeleting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        className="border-danger text-danger hover:bg-danger hover:text-paper-elevated focus-visible:ring-danger rounded-control min-h-11 border px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        Delete account
      </button>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <label className="text-sm font-semibold" htmlFor="delete-confirmation">
        Type {CONFIRMATION} to confirm
      </label>
      <input
        autoComplete="off"
        className="border-border bg-paper rounded-control focus-visible:ring-danger min-h-11 border px-3 focus-visible:ring-2 focus-visible:outline-none"
        id="delete-confirmation"
        onChange={(event) => setConfirmation(event.target.value)}
        value={confirmation}
      />
      {message ? (
        <p className="text-danger text-sm" role="alert">
          {message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          className="bg-danger text-paper-elevated rounded-control min-h-11 px-4 text-sm font-semibold disabled:opacity-50"
          disabled={confirmation !== CONFIRMATION || isDeleting}
          onClick={deleteAccount}
          type="button"
        >
          {isDeleting ? "Deleting…" : "Delete permanently"}
        </button>
        <button
          className="border-border rounded-control min-h-11 border px-4 text-sm font-semibold"
          disabled={isDeleting}
          onClick={() => {
            setConfirmation("");
            setIsOpen(false);
            setMessage(undefined);
          }}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
