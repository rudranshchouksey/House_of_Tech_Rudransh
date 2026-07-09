import * as Y from 'yjs';
import { db } from './db';

const COMPACTION_THRESHOLD = 20; // Number of outbox items before triggering compaction

export class SyncManager {
  private doc: Y.Doc;
  private documentId: string;

  constructor(documentId: string) {
    this.documentId = documentId;
    this.doc = new Y.Doc();

    // Listen to local changes and push them to the outbox
    this.doc.on('update', async (update: Uint8Array, origin: any) => {
      // Ignore updates that come from loading the initial state
      // or from server syncs (we'll tag them with origin = 'local-load' or 'server')
      if (origin === 'local-load' || origin === 'server' || origin === 'compaction') {
        return;
      }
      await this.pushToOutbox(update);
    });
  }

  /**
   * Initializes the Y.Doc by loading the merged local state from the IndexedDB 'documents' table.
   * If there are pending un-synced updates in the outbox, it applies them as well.
   */
  public async initialize(): Promise<Y.Doc> {
    const localDoc = await db.documents.get(this.documentId);
    if (localDoc) {
      Y.applyUpdate(this.doc, localDoc.updateBlob, 'local-load');
    }

    const pendingUpdates = await db.outbox
      .where('documentId')
      .equals(this.documentId)
      .sortBy('timestamp');

    if (pendingUpdates.length > 0) {
      const updateBlobs = pendingUpdates.map(u => u.updateBlob);
      const mergedUpdates = Y.mergeUpdates(updateBlobs);
      Y.applyUpdate(this.doc, mergedUpdates, 'local-load');
      
      // Attempt compaction on load if necessary
      if (pendingUpdates.length >= COMPACTION_THRESHOLD) {
        await this.compactOutbox();
      }
    }

    return this.doc;
  }

  /**
   * Pushes a new update delta into the offline outbox.
   * Triggers periodic compaction if the queue grows too large.
   */
  private async pushToOutbox(updateBlob: Uint8Array): Promise<void> {
    await db.outbox.add({
      documentId: this.documentId,
      updateBlob,
      timestamp: Date.now(),
    });

    const count = await db.outbox.where('documentId').equals(this.documentId).count();
    if (count >= COMPACTION_THRESHOLD) {
      await this.compactOutbox();
    }
  }

  /**
   * Compacts older local deltas to prevent memory leaks and client-side lag.
   * It fetches all outbox records for this document, merges them, updates
   * the base document in IndexedDB, and clears the compacted outbox records.
   */
  public async compactOutbox(): Promise<void> {
    await db.transaction('rw', db.documents, db.outbox, async () => {
      const pendingUpdates = await db.outbox
        .where('documentId')
        .equals(this.documentId)
        .sortBy('timestamp');

      if (pendingUpdates.length === 0) return;

      const updateBlobs = pendingUpdates.map(u => u.updateBlob);
      const mergedUpdates = Y.mergeUpdates(updateBlobs);
      
      // Update the base document state in the 'documents' table
      const existingDoc = await db.documents.get(this.documentId);
      
      let finalMergedState = mergedUpdates;
      if (existingDoc) {
         finalMergedState = Y.mergeUpdates([existingDoc.updateBlob, mergedUpdates]);
      }

      await db.documents.put({
        documentId: this.documentId,
        updateBlob: finalMergedState,
        updatedAt: Date.now(),
      });

      // Clear the compacted records from the outbox
      const idsToDelete = pendingUpdates.map(u => u.id).filter((id): id is number => id !== undefined);
      await db.outbox.bulkDelete(idsToDelete);
    });
  }

  /**
   * Fetch all pending updates from the outbox for this document.
   */
  public async getPendingUpdates() {
    return db.outbox
      .where('documentId')
      .equals(this.documentId)
      .sortBy('timestamp');
  }

  /**
   * Delete specific updates from the outbox (used after a successful sync).
   */
  public async clearOutbox(ids: number[]) {
    await db.outbox.bulkDelete(ids);
  }

  /**
   * Returns the underlying Yjs document instance.
   */
  public getDocument(): Y.Doc {
    return this.doc;
  }
}
