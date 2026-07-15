import "server-only";

import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const streamFileSchema = z.object({
  byte_size: z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  drive_file_id: z.string().min(1),
  file_name: z.string().min(1),
  id: z.string().uuid(),
  mime_type: z.string().min(1),
});

export interface OwnedStreamFile {
  byteSize: number;
  driveFileId: string;
  fileName: string;
  id: string;
  mimeType: string;
}

export async function getOwnedStreamFile(
  audiobookId: string,
  fileId: string,
): Promise<OwnedStreamFile | undefined> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) return undefined;

  const { data, error } = await supabase
    .from("audiobook_files")
    .select("id, drive_file_id, file_name, mime_type, byte_size")
    .eq("id", fileId)
    .eq("audiobook_id", audiobookId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to resolve the owned audio file.");
  }

  if (!data) return undefined;
  const file = streamFileSchema.parse(data);
  return {
    byteSize: file.byte_size,
    driveFileId: file.drive_file_id,
    fileName: file.file_name,
    id: file.id,
    mimeType: file.mime_type,
  };
}
