import "server-only";

import { z } from "zod";

import type { ConfirmImportInput, ValidatedDriveFile } from "./contracts";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function getDuplicateDriveFileIds(
  userId: string,
  driveFileIds: string[],
): Promise<string[]> {
  const supabase = createAdminSupabaseClient();

  if (!supabase || driveFileIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("audiobook_files")
    .select("drive_file_id")
    .eq("user_id", userId)
    .in("drive_file_id", driveFileIds);

  if (error) {
    throw new Error("Unable to check the selected files.", { cause: error });
  }

  return (data ?? []).map((row) => String(row.drive_file_id));
}

export async function commitValidatedImport(
  userId: string,
  input: ConfirmImportInput,
  validatedFiles: Map<string, ValidatedDriveFile>,
): Promise<string[]> {
  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    throw new Error("The server database connection is unavailable.");
  }

  const groups = input.groups.map((group) => ({
    author: group.author,
    files: group.fileIds.map((fileId, sequence) => {
      const file = validatedFiles.get(fileId);

      if (!file) {
        throw new Error("A selected file did not pass server validation.");
      }

      return { ...file, sequence };
    }),
    narrator: group.narrator,
    series: group.series,
    seriesPosition: group.seriesPosition,
    title: group.title,
  }));
  const { data, error } = await supabase.rpc("import_audiobook_groups", {
    p_groups: groups,
    p_user_id: userId,
  });

  if (error) {
    throw new Error("The audiobook import transaction failed.", {
      cause: error,
    });
  }

  return z.array(z.string().uuid()).parse(data);
}
