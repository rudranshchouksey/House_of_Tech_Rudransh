import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { LucideIcon, Heading1, Heading2, Heading3, Type, List, ListOrdered, Quote, Code, Minus } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
};

interface SlashCommandListProps {
  items: any[];
  command: (item: any) => void;
}

const SlashCommandList = forwardRef(({ items, command }: SlashCommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % items.length);
        return true;
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  if (!items.length) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col w-64 max-h-80 overflow-y-auto">
      {items.map((item, index) => {
        const Icon = icons[item.icon];
        return (
          <button
            key={index}
            className={`flex items-center space-x-2 px-4 py-2 text-left w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => selectItem(index)}
          >
            {Icon && <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-500 dark:text-gray-400"><Icon size={16} /></div>}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
});

SlashCommandList.displayName = 'SlashCommandList';

export default SlashCommandList;
