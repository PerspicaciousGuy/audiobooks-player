"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { Audiobook } from "@/types/audiobook";

export default function AudiobookMetadataEditor({
  audiobook,
}: {
  audiobook: Audiobook;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string>();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus(undefined);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/v1/audiobooks/${audiobook.id}`, {
        body: JSON.stringify({
          author: String(form.get("author") ?? "").trim() || null,
          description: String(form.get("description") ?? "").trim() || null,
          narrator: String(form.get("narrator") ?? "").trim() || null,
          title: String(form.get("title") ?? "").trim(),
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      const body = (await response.json()) as { detail?: string };
      if (!response.ok) throw new Error(body.detail ?? "Update failed.");
      setStatus("Book details updated.");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Book details could not be updated.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <div className="flex items-center gap-3">
        <button
          className="border-border hover:border-action rounded-control min-h-11 border px-4 text-sm font-semibold"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          Edit book details
        </button>
        {status ? (
          <p className="text-success text-sm" role="status">
            {status}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="border-border bg-paper-elevated rounded-card grid gap-4 border p-5 sm:grid-cols-2"
      onSubmit={save}
    >
      <h2 className="font-display text-2xl font-semibold sm:col-span-2">
        Correct book details
      </h2>
      {[
        ["title", "Title", audiobook.title],
        ["author", "Author", audiobook.author],
        ["narrator", "Narrator", audiobook.narrator],
      ].map(([name, label, value]) => (
        <label className="flex flex-col gap-2 text-sm font-semibold" key={name}>
          {label}
          <input
            className="border-border bg-paper rounded-control min-h-11 border px-3 font-normal"
            defaultValue={value}
            maxLength={300}
            name={name}
            required={name === "title"}
          />
        </label>
      ))}
      <label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2">
        Description
        <textarea
          className="border-border bg-paper rounded-control min-h-28 border p-3 font-normal"
          defaultValue={audiobook.description}
          maxLength={10_000}
          name="description"
        />
      </label>
      {status ? (
        <p className="text-danger text-sm sm:col-span-2" role="alert">
          {status}
        </p>
      ) : null}
      <div className="flex gap-2 sm:col-span-2">
        <button
          className="bg-action text-paper-elevated rounded-control min-h-11 px-4 text-sm font-semibold disabled:opacity-50"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Saving…" : "Save details"}
        </button>
        <button
          className="border-border rounded-control min-h-11 border px-4 text-sm font-semibold"
          disabled={isSaving}
          onClick={() => setIsOpen(false)}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
