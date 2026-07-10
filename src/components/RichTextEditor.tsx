'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { StarterKit } from '@tiptap/starter-kit';
import { Collaboration } from '@tiptap/extension-collaboration';
import { Placeholder } from '@tiptap/extension-placeholder';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';

import * as Y from 'yjs';
import { EditorToolbar } from './EditorToolbar';
import { FloatingMenu } from './FloatingMenu';
import SlashCommands, { getSuggestionItems, renderItems } from '../lib/slashCommands';
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
        placeholder: 'Start typing... Press "/" for commands',
      }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      // Only attach collaboration extensions if doc is provided
      ...(doc ? [
        Collaboration.configure({
          document: doc,
          field: 'content',
        }),
      ] : []),
      SlashCommands.configure({
        suggestion: {
          items: getSuggestionItems,
          render: renderItems,
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[800px] p-10 lg:p-16',
      },
    },
  }, [doc]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-gray-100 dark:bg-gray-950">
      {/* Fixed Toolbar */}
      <div className="z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <EditorToolbar editor={editor} syncStatus={syncStatus} />
      </div>
      
      {/* Editor Canvas Area */}
      <div className="flex-1 overflow-y-auto w-full flex justify-center py-8 px-4">
        <div className="w-full max-w-[850px] bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded min-h-[800px]">
          {doc ? (
            <>
              {editor && <FloatingMenu editor={editor} />}
              <EditorContent editor={editor} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[800px] text-gray-400">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading editor...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
