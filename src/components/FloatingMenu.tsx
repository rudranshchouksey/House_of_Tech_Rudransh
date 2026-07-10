import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Bold, Italic, Underline, Link, Highlighter, Sparkles, RefreshCcw, AlignLeft, Languages, CheckCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface FloatingMenuProps {
  editor: Editor;
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiActionName, setAiActionName] = useState('');

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

  const handleAiAction = async (action: string, promptPrefix: string) => {
    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    if (!selectedText) return;

    setIsAiLoading(true);
    setAiActionName(action);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `${promptPrefix}\n\nText:\n"${selectedText}"` }]
        }),
      });

      if (!response.ok) throw new Error('AI request failed');
      
      let newText = '';
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let chunk;
        while (!(chunk = await reader.read()).done) {
          const text = decoder.decode(chunk.value, { stream: true });
          
          // Parse stream format 0:"text"
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const content = JSON.parse(line.substring(2));
                newText += content;
              } catch (e) {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      }

      if (newText) {
        editor.chain().focus().insertContentAt({ from: selection.from, to: selection.to }, newText.trim()).run();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to process AI action.');
    } finally {
      setIsAiLoading(false);
      setAiActionName('');
    }
  };

  return (
    <BubbleMenu editor={editor} className="flex overflow-hidden items-center bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg p-1 space-x-0.5">
      {isAiLoading ? (
        <div className="flex items-center px-3 py-1.5 space-x-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
          <Loader2 size={16} className="animate-spin" />
          <span>AI is {aiActionName.toLowerCase()}...</span>
        </div>
      ) : (
        <>
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={<Bold size={16} />} title="Bold" />
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={<Italic size={16} />} title="Italic" />
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={<Underline size={16} />} title="Underline" />
          <MenuButton onClick={toggleLink} active={editor.isActive('link')} icon={<Link size={16} />} title="Link" />
          <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} icon={<Highlighter size={16} />} title="Highlight" />
          
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
          
          <MenuButton 
            onClick={() => handleAiAction('Rewriting', 'Rewrite the following text to make it sound better and more professional. Only return the rewritten text, without any conversational filler or quotes around it.')} 
            icon={<><RefreshCcw size={14} className="mr-1 text-purple-500" /> <span className="text-[13px] font-medium text-purple-600 dark:text-purple-400">Rewrite</span></>} 
            title="Rewrite" 
            customClass="px-2"
          />
          <MenuButton 
            onClick={() => handleAiAction('Summarizing', 'Summarize the following text concisely. Only return the summary, without any conversational filler.')} 
            icon={<><AlignLeft size={14} className="mr-1 text-purple-500" /> <span className="text-[13px] font-medium text-purple-600 dark:text-purple-400">Summarize</span></>} 
            title="Summarize" 
            customClass="px-2"
          />
          <MenuButton 
            onClick={() => handleAiAction('Improving', 'Fix any grammar mistakes and improve the writing style of the following text. Only return the improved text, without any conversational filler.')} 
            icon={<><CheckCheck size={14} className="mr-1 text-purple-500" /> <span className="text-[13px] font-medium text-purple-600 dark:text-purple-400">Improve</span></>} 
            title="Improve Writing" 
            customClass="px-2"
          />
          <MenuButton 
            onClick={() => handleAiAction('Translating', 'Translate the following text to English (if it is not English) or to Spanish (if it is English). Only return the translation, without any conversational filler.')} 
            icon={<><Languages size={14} className="mr-1 text-purple-500" /> <span className="text-[13px] font-medium text-purple-600 dark:text-purple-400">Translate</span></>} 
            title="Translate" 
            customClass="px-2"
          />
        </>
      )}
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
