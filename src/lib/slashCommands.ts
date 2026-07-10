import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import SlashCommandList from '../components/SlashCommandList';

export default Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      } as Omit<SuggestionOptions, 'editor'>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: 'Heading1',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: 'Heading2',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: 'Heading3',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      title: 'Text',
      description: 'Just start typing with plain text.',
      icon: 'Type',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bulleted list.',
      icon: 'List',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Ordered List',
      description: 'Create a list with numbering.',
      icon: 'ListOrdered',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote.',
      icon: 'Quote',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setBlockquote().run();
      },
    },
    {
      title: 'Code',
      description: 'Capture a code snippet.',
      icon: 'Code',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run();
      },
    },
    {
      title: 'Divider',
      description: 'Visually divide blocks.',
      icon: 'Minus',
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ].filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
};

export const renderItems = () => {
  let component: ReactRenderer;
  let popup: TippyInstance[];

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(SlashCommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },

    onUpdate(props: any) {
      component.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup[0].hide();
        return true;
      }
      return (component.ref as any)?.onKeyDown(props);
    },

    onExit() {
      popup[0].destroy();
      component.destroy();
    },
  };
};
