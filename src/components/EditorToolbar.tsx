import { cn } from '@/lib/utils';
import { Bold, Italic, Strikethrough, Heading1, Heading2, Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { SyncStatus } from '@/lib/sync/engine';

interface EditorToolbarProps {
  editor: Editor | null;
  syncStatus: SyncStatus;
}

export function EditorToolbar({ editor, syncStatus }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive('bold')}
          icon={<Bold size={16} />}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive('italic')}
          icon={<Italic size={16} />}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          isActive={editor.isActive('strike')}
          icon={<Strikethrough size={16} />}
        />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-2" />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          isActive={editor.isActive('heading', { level: 1 })}
          icon={<Heading1 size={16} />}
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 size={16} />}
        />
      </div>

      <div className="flex items-center pr-2">
        <SyncStatusBadge status={syncStatus} />
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, isActive, icon }: { onClick: () => void, isActive: boolean, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors",
        isActive && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      )}
    >
      {icon}
    </button>
  );
}

function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const config = {
    'SAVED_LOCALLY': { icon: <CheckCircle2 size={14} />, text: 'Saved locally', className: 'text-gray-500 dark:text-gray-400' },
    'SYNCING': { icon: <RefreshCw size={14} className="animate-spin" />, text: 'Syncing...', className: 'text-blue-600 dark:text-blue-500' },
    'SYNCED': { icon: <Cloud size={14} />, text: 'Saved to cloud', className: 'text-green-600 dark:text-green-500' },
    'OFFLINE': { icon: <CloudOff size={14} />, text: 'Offline', className: 'text-amber-600 dark:text-amber-500' }
  };

  const { icon, text, className } = config[status];

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-medium", className)}>
      {icon}
      <span>{text}</span>
    </div>
  );
}
