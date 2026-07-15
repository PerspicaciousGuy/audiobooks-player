"use client";

import Dexie, { type EntityTable } from "dexie";

export type OfflineStorageKind = "cache" | "opfs";

export interface OfflineDownloadRecord {
  author: string;
  audiobookId: string;
  bookTitle: string;
  byteSize: number;
  downloadedAt: string | null;
  driveVersion: string | null;
  mimeType: string;
  sequence: number;
  sourceId: string;
  sourceName: string;
  status: "complete" | "partial";
  storageKind: OfflineStorageKind;
}

class OfflineDatabase extends Dexie {
  downloads!: EntityTable<OfflineDownloadRecord, "sourceId">;

  constructor() {
    super("quiet-library-offline-v1");
    this.version(1).stores({
      downloads: "&sourceId, audiobookId, status, downloadedAt",
    });
  }
}

let database: OfflineDatabase | undefined;

export function getOfflineDatabase(): OfflineDatabase {
  database ??= new OfflineDatabase();
  return database;
}
