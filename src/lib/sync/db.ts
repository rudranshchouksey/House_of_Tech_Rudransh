import Dexie, { Table } from 'dexie';

export interface LocalDocument {
  documentId: string;
  updateBlob: Uint8Array; // Stores the fully merged local state as a binary update
  updatedAt: number;
}

export interface OutboxUpdate {
  id?: number; // Auto-incremented local ID
  documentId: string;
  updateBlob: Uint8Array;
  timestamp: number;
}

export class SyncDatabase extends Dexie {
  documents!: Table<LocalDocument, string>;
  outbox!: Table<OutboxUpdate, number>;

  constructor() {
    super('SyncDatabase');
    this.version(1).stores({
      documents: 'documentId, updatedAt',
      outbox: '++id, documentId, timestamp' // Add indexes on documentId and timestamp
    });
  }
}

export const db = new SyncDatabase();
