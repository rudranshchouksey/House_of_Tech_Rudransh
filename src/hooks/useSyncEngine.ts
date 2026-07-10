import { useState, useEffect, useRef } from 'react';
import { SyncManager } from '@/lib/sync/manager';
import { SyncEngine, SyncStatus } from '@/lib/sync/engine';
import * as Y from 'yjs';

export function useSyncEngine(documentId: string) {
  const [status, setStatus] = useState<SyncStatus>('OFFLINE');
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  
  const managerRef = useRef<SyncManager | null>(null);
  const engineRef = useRef<SyncEngine | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const manager = new SyncManager(documentId);
      const initializedDoc = await manager.initialize();
      
      if (isMounted) {
        managerRef.current = manager;
        setDoc(initializedDoc);

        const engine = new SyncEngine(documentId, manager, (newStatus) => {
          if (isMounted) setStatus(newStatus);
        });
        
        engineRef.current = engine;
        engine.start();
      } else {
        manager.getDocument().destroy();
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (engineRef.current) {
        engineRef.current.stop();
      }
      if (managerRef.current) {
        managerRef.current.getDocument().destroy();
      }
    };
  }, [documentId]);

  return { doc, status };
}
