import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncEngine, SyncStatus } from '../engine';
import { SyncManager } from '../manager';
import * as Y from 'yjs';

// We mock SyncManager methods that SyncEngine relies on
const mockGetPendingUpdates = vi.fn();
const mockGetDocument = vi.fn();
const mockClearPendingUpdate = vi.fn();

class MockSyncManager {
  initializeDoc = vi.fn().mockResolvedValue(new Y.Doc());
  enqueueLocalUpdate = vi.fn().mockResolvedValue(undefined);
  getPendingUpdates = mockGetPendingUpdates;
  clearPendingUpdate = mockClearPendingUpdate;
  clearOutbox = vi.fn().mockResolvedValue(undefined);
  getDocument = mockGetDocument;
}

describe('SyncEngine', () => {
  let engine: any;
  let mockFetch: any;
  let syncManager: any;

  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    syncManager = new MockSyncManager();
    
    // Give getDocument a valid return for triggerSync
    mockGetDocument.mockReturnValue(new Y.Doc());
    mockGetPendingUpdates.mockResolvedValue([]);

    engine = new SyncEngine('test-doc-id', syncManager, () => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    engine.stop();
  });

  it('Writing data while offline queues the update and retains state without network calls', async () => {
    engine.start();
    // Engine starts offline because navigator.onLine = false
    expect(engine.status).toBe('OFFLINE');

    // Manually trigger what happens when tip-tap writes locally
    await syncManager.enqueueLocalUpdate(new Uint8Array([1]));

    expect(mockFetch).not.toHaveBeenCalled();
    expect(engine.status).toBe('OFFLINE');
  });

  it('Going online successfully fires the network payload queue', async () => {
    // Setup pending updates for when we go online
    mockGetPendingUpdates.mockResolvedValue([{ id: 1, blob: new Uint8Array([1, 2, 3]) }]);
    
    engine.start();

    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    });

    // Simulate going online
    Object.defineProperty(navigator, 'onLine', { value: true });
    window.dispatchEvent(new Event('online'));

    await vi.runOnlyPendingTimersAsync();

    // Since we went online and there are pending updates, fetch should be called to POST them
    expect(mockFetch).toHaveBeenCalled();
  });
});
