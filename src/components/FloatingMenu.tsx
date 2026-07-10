import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Bold, Italic, Underline, Link, Highlighter, Sparkles, RefreshCcw, AlignLeft, Languages, CheckCheck, Loader2, ChevronDown, List, FileText, Expand, Shrink, FileQuestion } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FloatingMenuProps {
  editor: Editor;
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiActionName, setAiActionName] = useState('');
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);

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
          messages: [{ role: 'user', content: `${promptPrefix}\n\nSelected Text:\n"${selectedText}"\n\nIf the action asks for something different from replacing the text (like explaining), still return just the explanation. Otherwise, return only the rewritten/modified text without quotes or conversation.` }]
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
    } catch (error: any) {
      console.error(error);
      toast.error('AI Request Failed', {
        description: error.message || 'Unable to process your request.',
        action: {
          label: 'Retry',
          onClick: () => handleAiAction(action, promptPrefix),
        },
      });
    } finally {
      setIsAiLoading(false);
      setAiActionName('');
      setIsAiMenuOpen(false);
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
          
          <div className="relative">
            <button 
              onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 transition-colors border border-purple-200 dark:border-purple-800/50"
            >
              <Sparkles size={14} />
              <span className="text-[13px] font-medium">Ask AI</span>
              <ChevronDown size={14} />
            </button>
            
            {isAiMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  <AiOption onClick={() => handleAiAction('Continuing', 'Continue writing from the following text naturally.')} icon={<Sparkles size={14} />} label="Continue Writing" />
                  <AiOption onClick={() => handleAiAction('Rewriting', 'Rewrite the following text to make it better.')} icon={<RefreshCcw size={14} />} label="Rewrite" />
                  <AiOption onClick={() => handleAiAction('Improving', 'Improve the writing style of the following text.')} icon={<CheckCheck size={14} />} label="Improve Writing" />
                  <AiOption onClick={() => handleAiAction('Fixing Grammar', 'Fix all grammar and spelling mistakes in the following text.')} icon={<CheckCheck size={14} />} label="Grammar Fix" />
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                  <AiOption onClick={() => handleAiAction('Summarizing', 'Summarize the following text.')} icon={<AlignLeft size={14} />} label="Summarize" />
                  <AiOption onClick={() => handleAiAction('Translating', 'Translate the following text to English (if not English) or Spanish (if English).')} icon={<Languages size={14} />} label="Translate" />
                  <AiOption onClick={() => handleAiAction('Expanding', 'Expand on the following text with more details.')} icon={<Expand size={14} />} label="Expand" />
                  <AiOption onClick={() => handleAiAction('Shortening', 'Shorten the following text while keeping the main points.')} icon={<Shrink size={14} />} label="Shorten" />
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                  <AiOption onClick={() => handleAiAction('Explaining', 'Explain the following text in simple terms.')} icon={<FileQuestion size={14} />} label="Explain" />
                  <AiOption onClick={() => handleAiAction('Generating Bullets', 'Convert the following text into a list of bullet points.')} icon={<List size={14} />} label="Generate Bullet Points" />
                  <AiOption onClick={() => handleAiAction('Generating Title', 'Generate a short, catchy title based on the following text.')} icon={<FileText size={14} />} label="Generate Title" />
                </div>
              </div>
            )}
          </div>
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

function AiOption({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
    >
      <span className="text-purple-500">{icon}</span>
      {label}
    </button>
  );
}
