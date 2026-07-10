import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { Bold, Italic, Underline, Link, Highlighter, Sparkles } from 'lucide-react';

interface FloatingMenuProps {
  editor: Editor;
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  if (!editor) {
    return null;
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

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex overflow-hidden items-center bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg p-1 space-x-1">
      <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={<Bold size={16} />} title="Bold" />
      <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={<Italic size={16} />} title="Italic" />
      <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={<Underline size={16} />} title="Underline" />
      <MenuButton onClick={toggleLink} active={editor.isActive('link')} icon={<Link size={16} />} title="Link" />
      <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} icon={<Highlighter size={16} />} title="Highlight" />
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>
      
      <MenuButton 
        onClick={() => alert("AI features are available in the right sidebar!")} 
        active={false} 
        icon={<><Sparkles size={14} className="mr-1 text-purple-500" /> <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Ask AI</span></>} 
        title="Ask AI" 
        customClass="px-2"
      />
    </BubbleMenu>
  );
}

function MenuButton({ 
  icon, 
  active = false, 
  onClick, 
  title,
  customClass = ''
}: { 
  icon: React.ReactNode, 
  active?: boolean, 
  onClick: () => void,
  title?: string,
  customClass?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded flex items-center justify-center transition-colors
        ${active ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
        ${customClass}
      `}
    >
      {icon}
    </button>
  );
}
