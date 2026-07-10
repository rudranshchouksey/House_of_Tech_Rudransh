'use client';

import { useSyncEngine } from '@/hooks/useSyncEngine';
import { RichTextEditor } from '@/components/RichTextEditor';
import VersionTimeline from '@/components/VersionTimeline';
import { AiSidebar } from '@/components/AiSidebar';
import { Header } from '@/components/Header';

interface WorkspaceClientProps {
  documentId: string;
  currentUser: { id: string; name: string; color: string };
}

export function WorkspaceClient({ documentId, currentUser }: WorkspaceClientProps) {
  const syncEngineState = useSyncEngine(documentId);
  const doc = syncEngineState?.doc;
  const status = syncEngineState?.status || 'OFFLINE';

  if (!doc) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p>Initializing local workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      <Header documentId={documentId} syncStatus={status} currentUser={currentUser} />
      
      <div className="flex flex-1 overflow-hidden">
      {/* Editor Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        <RichTextEditor doc={doc} syncStatus={status} currentUser={currentUser} />
      </main>

      {/* Sidebar Area */}
      <aside className="w-80 flex-shrink-0 flex flex-col bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 z-20 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden h-full">
        <div className="flex-1 overflow-y-auto">
          <AiSidebar doc={doc} documentId={documentId} />
        </div>
        <div className="flex-1 overflow-y-auto border-t border-gray-200 dark:border-gray-800">
          <VersionTimeline documentId={documentId} />
        </div>
      </aside>
      </div>
    </div>
  );
}
