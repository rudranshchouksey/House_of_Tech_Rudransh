'use client';

import { useState, useEffect } from 'react';
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
import { CommandPalette } from './CommandPalette';
import SlashCommands, { getSuggestionItems, renderItems } from '../lib/slashCommands';
import { FontSize } from '../lib/fontSize';
import { SyncStatus } from '@/lib/sync/engine';

interface RichTextEditorProps {
  doc: Y.Doc | null;
  syncStatus: SyncStatus;
  currentUser: { id: string; name: string; color: string };
}

export function RichTextEditor({ doc, syncStatus, currentUser }: RichTextEditorProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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
      FontSize,
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
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[800px] p-12 lg:p-20 text-gray-800 dark:text-gray-200 selection:bg-indigo-200 dark:selection:bg-indigo-900/50 leading-relaxed',
      },
    },
  }, [doc]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-gray-50/50 dark:bg-gray-950/50 transition-colors">
      {/* Fixed Toolbar */}
      <div className="z-20 bg-white/70 dark:bg-gray-950/70 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0">
        <EditorToolbar editor={editor} syncStatus={syncStatus} />
      </div>
      
      {/* Editor Canvas Area */}
      <div className="flex-1 overflow-y-auto w-full flex justify-center py-10 px-4 sm:px-8 lg:px-12 bg-gray-100/30 dark:bg-gray-950/30">
        <div className="w-full max-w-[850px] bg-white dark:bg-gray-900 shadow-xl dark:shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl min-h-[1056px] h-fit transition-shadow duration-300">
          {doc ? (
            <>
              {!editor?.state.doc.textContent && !editor?.isActive('image') && !editor?.isActive('table') && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-50 p-8 text-center mt-32">
                  <div className="w-32 h-32 mb-6 text-gray-300 dark:text-gray-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <line x1="10" y1="9" x2="8" y2="9" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-400 dark:text-gray-500 mb-2">Ready to create?</h3>
                  <p className="text-gray-400 dark:text-gray-500">Start typing to begin, or type <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono">/</kbd> to insert commands.</p>
                </div>
              )}
              {editor && <FloatingMenu editor={editor} />}
              <div className="relative z-10">
                <EditorContent editor={editor} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[1056px] text-gray-400">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading editor...</p>
            </div>
          )}
        </div>
      </div>
      
      {editor && (
        <CommandPalette 
          isOpen={isCommandPaletteOpen} 
          onClose={() => setIsCommandPaletteOpen(false)} 
          editor={editor} 
        />
      )}
    </div>
  );
}
