import { Editor } from '@tiptap/react';
import { SyncStatus } from '@/lib/sync/engine';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Undo, Redo,
  Link, Image as ImageIcon, Table as TableIcon,
  Minus, Code, Quote, Highlighter, RemoveFormatting
} from 'lucide-react';
import { useState } from 'react';

interface EditorToolbarProps {
  editor: Editor | null;
  syncStatus: SyncStatus;
}

export function EditorToolbar({ editor, syncStatus }: EditorToolbarProps) {
  if (!editor) {
    return <div className="h-12 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 animate-pulse" />;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const fonts = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New'];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-900 w-full overflow-x-auto custom-scrollbar">
      {/* History */}
      <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 dark:border-gray-700">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={<Undo size={16} />} title="Undo" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={<Redo size={16} />} title="Redo" />
      </div>

      {/* Font Family (Simple Select for now) */}
      <div className="flex items-center pr-2 border-r border-gray-300 dark:border-gray-700">
        <select 
          className="text-sm p-1 rounded bg-transparent border-none outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
        >
          {fonts.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Headings */}
      <div className="flex items-center pr-2 border-r border-gray-300 dark:border-gray-700">
        <select 
          className="text-sm p-1 rounded bg-transparent border-none outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 w-24"
          onChange={(e) => {
            const val = e.target.value;
            if (val === '0') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
          }}
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' :
            editor.isActive('heading', { level: 4 }) ? '4' : '0'
          }
        >
          <option value="0">Normal text</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>
      </div>

      {/* Typography */}
      <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 dark:border-gray-700">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={<Bold size={16} />} title="Bold (Ctrl+B)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={<Italic size={16} />} title="Italic (Ctrl+I)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={<Underline size={16} />} title="Underline (Ctrl+U)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={<Strikethrough size={16} />} title="Strikethrough" />
      </div>

      {/* Color & Highlight */}
      <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 dark:border-gray-700">
        <input 
          type="color" 
          onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
          title="Text Color"
        />
        <input 
          type="color" 
          onInput={event => editor.chain().focus().toggleHighlight({ color: (event.target as HTMLInputElement).value }).run()}
          value={editor.getAttributes('highlight').color || '#ffff00'}
          className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
          title="Highlight Color"
        />
        <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} icon={<RemoveFormatting size={16} />} title="Clear Formatting" />
      </div>

      {/* Alignment */}
      <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 dark:border-gray-700">
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={16} />} title="Align Left" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={16} />} title="Align Center" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={16} />} title="Align Right" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} icon={<AlignJustify size={16} />} title="Justify" />
      </div>

      {/* Lists */}
      <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 dark:border-gray-700">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={<List size={16} />} title="Bullet List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={<ListOrdered size={16} />} title="Numbered List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} icon={<CheckSquare size={16} />} title="Checklist" />
      </div>

      {/* Insertions */}
      <div className="flex items-center space-x-1 pr-2">
        <ToolbarButton onClick={toggleLink} active={editor.isActive('link')} icon={<Link size={16} />} title="Insert Link" />
        <ToolbarButton onClick={addImage} icon={<ImageIcon size={16} />} title="Insert Image" />
        <ToolbarButton onClick={insertTable} active={editor.isActive('table')} icon={<TableIcon size={16} />} title="Insert Table" />
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<Minus size={16} />} title="Horizontal Rule" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={<Quote size={16} />} title="Quote" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} icon={<Code size={16} />} title="Code Block" />
      </div>
    </div>
  );
}

function ToolbarButton({ 
  icon, 
  active = false, 
  onClick, 
  disabled = false,
  title
}: { 
  icon: React.ReactNode, 
  active?: boolean, 
  onClick: () => void,
  disabled?: boolean,
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded flex items-center justify-center transition-colors
        ${active ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {icon}
    </button>
  );
}
