"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import PreferenceFields from "@/components/settings/PreferenceFields";
import type { UserPreferences } from "@/features/preferences/contracts";

interface PreferencesFormProps {
  canPersist: boolean;
  initialPreferences: UserPreferences;
}

export default function PreferencesForm({
  canPersist,
  initialPreferences,
}: PreferencesFormProps) {
  const router = useRouter();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [status, setStatus] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canPersist) return;
    setIsSaving(true);
    setStatus(undefined);

    try {
      const response = await fetch("/api/v1/preferences", {
        body: JSON.stringify(preferences),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      const body = (await response.json()) as { detail?: string };
      if (!response.ok) throw new Error(body.detail ?? "Save failed.");
      setStatus("Preferences saved across your account.");
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Preferences could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-10" onSubmit={save}>
      <PreferenceFields onChange={setPreferences} preferences={preferences} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="bg-action text-paper-elevated rounded-control min-h-11 px-5 text-sm font-semibold disabled:opacity-50"
          disabled={!canPersist || isSaving}
          type="submit"
        >
          {isSaving
            ? "Saving…"
            : canPersist
              ? "Save preferences"
              : "Preview only"}
        </button>
        <p className="text-ink-muted text-sm" role="status">
          {status ??
            (canPersist
              ? "Preferences sync with this account."
              : "Connect Supabase Auth to save preview changes.")}
        </p>
      </div>
    </form>
  );
}
