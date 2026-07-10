import React, { useState, useEffect, useRef } from 'react';
import { Search, Type, Heading1, Heading2, List, Image, Code, CheckSquare, Quote } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  editor: any;
}

export function CommandPalette({ isOpen, onClose, editor }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    { id: 'h1', title: 'Heading 1', icon: <Heading1 size={18} />, run: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { id: 'h2', title: 'Heading 2', icon: <Heading2 size={18} />, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { id: 'p', title: 'Paragraph', icon: <Type size={18} />, run: () => editor.chain().focus().setParagraph().run() },
    { id: 'bullet', title: 'Bullet List', icon: <List size={18} />, run: () => editor.chain().focus().toggleBulletList().run() },
    { id: 'check', title: 'Checklist', icon: <CheckSquare size={18} />, run: () => editor.chain().focus().toggleTaskList().run() },
    { id: 'quote', title: 'Quote', icon: <Quote size={18} />, run: () => editor.chain().focus().toggleBlockquote().run() },
    { id: 'code', title: 'Code Block', icon: <Code size={18} />, run: () => editor.chain().focus().toggleCodeBlock().run() },
    { id: 'image', title: 'Image', icon: <Image size={18} />, run: () => {
      const url = window.prompt('Image URL');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    }},
  ];

  const filteredActions = actions.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          // The parent should open this
        }
        return;
      }

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].run();
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-lg"
            placeholder="Type a command or search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No commands found.
            </div>
          ) : (
            filteredActions.map((action, index) => (
              <button
                key={action.id}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  action.run();
                  onClose();
                }}
              >
                <div className={`mr-3 ${index === selectedIndex ? 'text-blue-500' : 'text-gray-400'}`}>
                  {action.icon}
                </div>
                <span className="font-medium">{action.title}</span>
              </button>
            ))
          )}
        </div>
        <div className="bg-gray-50 dark:bg-gray-950 px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 flex justify-between">
          <span>Use <kbd className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">↑</kbd> <kbd className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">↓</kbd> to navigate</span>
          <span>Use <kbd className="font-mono bg-gray-200 dark:bg-gray-800 px-1 rounded">Enter</kbd> to select</span>
        </div>
      </div>
    </div>
  );
}
