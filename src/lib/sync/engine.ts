import { SyncManager } from './manager';
import * as Y from 'yjs';

export type SyncStatus = 'SAVED_LOCALLY' | 'SYNCING' | 'SYNCED' | 'OFFLINE';

export class SyncEngine {
  private documentId: string;
  private syncManager: SyncManager;
  private status: SyncStatus = 'OFFLINE';
  private onStatusChange?: (status: SyncStatus) => void;
  
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private backoffMs = 1000;
  private isSyncing = false;

  constructor(documentId: string, syncManager: SyncManager, onStatusChange?: (status: SyncStatus) => void) {
    this.documentId = documentId;
    this.syncManager = syncManager;
    this.onStatusChange = onStatusChange;

    if (typeof window !== 'undefined') {
      this.status = navigator.onLine ? 'SYNCED' : 'OFFLINE';
      this.updateStatus(this.status);
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  public start() {
    if (this.status !== 'OFFLINE') {
      this.triggerSync();
    }
    // Heartbeat every 30 seconds to catch silent disconnections
    this.heartbeatInterval = setInterval(() => {
      if (this.status !== 'OFFLINE') {
        this.triggerSync();
      }
    }, 30000);
  }

  public stop() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.updateStatus('SYNCED'); // Optimistically update to synced until sync proves otherwise
    this.backoffMs = 1000; // Reset backoff
    this.triggerSync();
  };

  private handleOffline = () => {
    this.updateStatus('OFFLINE');
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
  };

  private updateStatus(status: SyncStatus) {
    if (this.status !== status) {
      this.status = status;
      if (this.onStatusChange) {
        this.onStatusChange(status);
      }
    }
  }

  public async triggerSync() {
    if (this.isSyncing || this.status === 'OFFLINE') return;
    this.isSyncing = true;
    this.updateStatus('SYNCING');

    try {
      // 1. Compute state vector and gather outbox updates
      const doc = this.syncManager.getDocument();
      const stateVector = Y.encodeStateVector(doc);
      const stateVectorBase64 = btoa(String.fromCharCode(...new Uint8Array(stateVector)));

      // Fetch outbox items to push
      const pendingUpdates = await this.syncManager.getPendingUpdates(); 
      let payload: any = new Uint8Array(0);
      let pendingIds: number[] = [];

      if (pendingUpdates.length > 0) {
        const updateBlobs = pendingUpdates.map(u => u.updateBlob);
        payload = Y.mergeUpdates(updateBlobs);
        pendingIds = pendingUpdates.map(u => u.id as number);
      }

      // 2. Perform the sync via API route
      const response = await fetch(`/api/documents/${this.documentId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-yjs-state-vector': stateVectorBase64,
        },
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Sync failed with status: ${response.status}`);
      }

      // 3. Process the response (missing server updates)
      const buffer = await response.arrayBuffer();
      const serverDelta = new Uint8Array(buffer);

      if (serverDelta.length > 0) {
        Y.applyUpdate(doc, serverDelta, 'server');
      }

      // 4. Clear synced items from outbox
      if (pendingIds.length > 0) {
        await this.syncManager.clearOutbox(pendingIds);
      }

      // Sync successful, reset backoff
      this.backoffMs = 1000;
      this.updateStatus('SYNCED');
    } catch (error) {
      console.error('[SYNC ENGINE ERROR]', error);
      this.updateStatus('SAVED_LOCALLY');
      this.scheduleRetry();
    } finally {
      this.isSyncing = false;
    }
  }

  private scheduleRetry() {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    
    // Exponential backoff capped at 1 minute
    this.backoffMs = Math.min(this.backoffMs * 2, 60000);

    this.retryTimeout = setTimeout(() => {
      this.triggerSync();
    }, this.backoffMs);
  }
}
