'use client';

import { useMemo } from 'react';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import Placeholder from '@tiptap/extension-placeholder';
import * as Y from 'yjs';
import { EditorToolbar } from './EditorToolbar';
import { SyncStatus } from '@/lib/sync/engine';

interface RichTextEditorProps {
  doc: Y.Doc | null;
  syncStatus: SyncStatus;
  currentUser: { id: string; name: string; color: string };
}

export function RichTextEditor({ doc, syncStatus, currentUser }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        history: false, // History is handled by Yjs
      } as any),
      Placeholder.configure({
        placeholder: 'Start writing your collaborative document...',
      }),
      // Only attach collaboration extensions if doc is provided
      ...(doc ? [
        Collaboration.configure({
          document: doc,
          field: 'content',
        }),
      ] : []),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8',
      },
    },
  }, [doc]);

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <EditorToolbar editor={editor} syncStatus={syncStatus} />
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 flex justify-center">
        <div className="w-full max-w-4xl my-8 bg-white dark:bg-gray-950 shadow-sm border border-gray-200 dark:border-gray-800 min-h-[800px]">
          {doc ? (
            <EditorContent editor={editor} />
          ) : (
            <div className="p-8 text-gray-500 animate-pulse">Initializing editor...</div>
          )}
        </div>
      </div>
    </div>
  );
}
