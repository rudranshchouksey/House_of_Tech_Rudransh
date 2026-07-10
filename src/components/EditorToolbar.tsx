import { Editor } from '@tiptap/react';
import { SyncStatus } from '@/lib/sync/engine';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Undo, Redo,
  Link, Image as ImageIcon, Table as TableIcon,
  Minus, Code, Quote, Highlighter, RemoveFormatting,
  Smile, Search, Printer, Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  Indent as IndentIcon, Outdent as OutdentIcon
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  syncStatus: SyncStatus;
}

export function EditorToolbar({ editor, syncStatus }: EditorToolbarProps) {
  if (!editor) {
    return <div className="h-12 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse" />;
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

  const fonts = ['Inter', 'Roboto', 'Poppins', 'Open Sans', 'Lato', 'Arial', 'Georgia', 'Times New Roman', 'Monospace'];
  const sizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '30', '36', '48', '72'];

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl w-full overflow-x-auto custom-scrollbar border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm my-3 mx-auto max-w-[calc(100%-2rem)] md:max-w-4xl transition-all">
      {/* History */}
      <div className="flex items-center space-x-0.5 pr-2 border-r border-gray-300 dark:border-gray-600">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={<Undo size={16} />} title="Undo (Ctrl+Z)" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={<Redo size={16} />} title="Redo (Ctrl+Y)" />
        <ToolbarButton onClick={() => {}} disabled icon={<Printer size={16} />} title="Print" />
      </div>

      {/* Font Family */}
      <div className="flex items-center pr-2 pl-1 border-r border-gray-300 dark:border-gray-600">
        <select 
          className="text-sm px-2 py-1 rounded bg-transparent border-none outline-none cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700 w-[120px] font-medium text-gray-700 dark:text-gray-200"
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
        >
          {fonts.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Font Size */}
      <div className="flex items-center pr-2 border-r border-gray-300 dark:border-gray-600">
        <select 
          className="text-sm px-1 py-1 rounded bg-transparent border-none outline-none cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700 w-[55px] font-medium text-gray-700 dark:text-gray-200"
          onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}px`).run()}
          value={(editor.getAttributes('textStyle').fontSize || '16px').replace('px', '')}
        >
          {sizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Typography Controls */}
      <div className="flex items-center pr-2 pl-1 border-r border-gray-300 dark:border-gray-600 gap-1 text-[11px] font-medium text-gray-500 flex-col justify-center">
        <div className="flex items-center justify-between w-[90px]">
          <span title="Line Height" className="cursor-help mr-1">LH</span>
          <select 
            className="text-xs px-1 rounded bg-transparent border border-transparent outline-none cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700 w-[60px]"
            onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()}
            value={editor.getAttributes('paragraph').lineHeight || 'normal'}
          >
            <option value="normal">Normal</option>
            <option value="1">1</option>
            <option value="1.15">1.15</option>
            <option value="1.5">1.5</option>
            <option value="2">2</option>
          </select>
        </div>
        <div className="flex items-center justify-between w-[90px]">
          <span title="Letter Spacing" className="cursor-help mr-1">LS</span>
          <select 
            className="text-xs px-1 rounded bg-transparent border border-transparent outline-none cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700 w-[60px]"
            onChange={(e) => editor.chain().focus().setLetterSpacing(e.target.value).run()}
            value={editor.getAttributes('textStyle').letterSpacing || 'normal'}
          >
            <option value="normal">Normal</option>
            <option value="-0.05em">Tight</option>
            <option value="0.05em">Wide</option>
            <option value="0.1em">Wider</option>
          </select>
        </div>
      </div>
      
      {/* Formatting */}
      <div className="flex items-center space-x-0.5 pl-1 pr-2 border-r border-gray-300 dark:border-gray-600">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={<Bold size={16} />} title="Bold (Ctrl+B)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={<Italic size={16} />} title="Italic (Ctrl+I)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={<Underline size={16} />} title="Underline (Ctrl+U)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={<Strikethrough size={16} />} title="Strikethrough" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} icon={<SubscriptIcon size={16} />} title="Subscript" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} icon={<SuperscriptIcon size={16} />} title="Superscript" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} icon={<Code size={16} />} title="Inline Code" />
      </div>

      {/* Color & Highlight */}
      <div className="flex items-center space-x-1 pl-1 pr-2 border-r border-gray-300 dark:border-gray-600">
        <div className="relative flex items-center justify-center p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700 rounded cursor-pointer" title="Text Color">
          <div className="flex flex-col items-center">
            <span className="text-[12px] leading-[10px] font-bold text-gray-700 dark:text-gray-200">A</span>
            <div className="w-3 h-1 mt-[2px]" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
          </div>
          <input 
            type="color" 
            onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        <div className="relative flex items-center justify-center p-1 hover:bg-gray-200/50 dark:hover:bg-gray-700 rounded cursor-pointer" title="Highlight Color">
          <div className="flex flex-col items-center">
            <Highlighter size={14} className="text-gray-700 dark:text-gray-200" />
            <div className="w-3 h-1 mt-[2px]" style={{ backgroundColor: editor.getAttributes('highlight').color || 'transparent' }} />
          </div>
          <input 
            type="color" 
            onInput={event => editor.chain().focus().toggleHighlight({ color: (event.target as HTMLInputElement).value }).run()}
            value={editor.getAttributes('highlight').color || '#ffff00'}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
      </div>

      {/* Insert */}
      <div className="flex items-center space-x-0.5 pl-1 pr-2 border-r border-gray-300 dark:border-gray-600">
        <ToolbarButton onClick={toggleLink} active={editor.isActive('link')} icon={<Link size={16} />} title="Insert Link (Ctrl+K)" />
        <ToolbarButton onClick={addImage} icon={<ImageIcon size={16} />} title="Insert Image" />
        <ToolbarButton onClick={insertTable} icon={<TableIcon size={16} />} title="Insert Table" />
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<Minus size={16} />} title="Divider" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={<Quote size={16} />} title="Quote" />
      </div>

      {/* Alignment */}
      <div className="flex items-center space-x-0.5 pl-1 pr-2 border-r border-gray-300 dark:border-gray-600">
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={16} />} title="Align Left (Ctrl+Shift+L)" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={16} />} title="Align Center (Ctrl+Shift+E)" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={16} />} title="Align Right (Ctrl+Shift+R)" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} icon={<AlignJustify size={16} />} title="Justify (Ctrl+Shift+J)" />
        <ToolbarButton onClick={() => editor.chain().focus().outdent().run()} disabled={!editor.can().outdent()} icon={<OutdentIcon size={16} />} title="Outdent" />
        <ToolbarButton onClick={() => editor.chain().focus().indent().run()} disabled={!editor.can().indent()} icon={<IndentIcon size={16} />} title="Indent" />
      </div>

      {/* Lists */}
      <div className="flex items-center space-x-0.5 pl-1 pr-2 border-r border-gray-300 dark:border-gray-600">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={<List size={16} />} title="Bulleted List (Ctrl+Shift+8)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={<ListOrdered size={16} />} title="Numbered List (Ctrl+Shift+7)" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} icon={<CheckSquare size={16} />} title="Checklist" />
      </div>

      <div className="flex items-center space-x-0.5 pl-1">
        <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} icon={<RemoveFormatting size={16} />} title="Clear Formatting" />
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
      className={`p-1.5 rounded-lg flex items-center justify-center transition-all duration-200
        ${active ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 shadow-inner' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
      `}
    >
      {icon}
    </button>
  );
}
