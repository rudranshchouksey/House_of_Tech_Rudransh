'use client';

import { useSyncEngine } from '@/hooks/useSyncEngine';
import { RichTextEditor } from '@/components/RichTextEditor';
import VersionTimeline from '@/components/VersionTimeline';
import { AiSidebar } from '@/components/AiSidebar';

interface WorkspaceClientProps {
  documentId: string;
  currentUser: { id: string; name: string; color: string };
}

export function WorkspaceClient({ documentId, currentUser }: WorkspaceClientProps) {
  const { doc, status } = useSyncEngine(documentId);

  return (
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
  );
}
