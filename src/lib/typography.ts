import { Extension } from '@tiptap/core';

export const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultLineHeight: 'normal',
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
            renderHTML: attributes => {
              if (attributes.lineHeight === this.options.defaultLineHeight) {
                return {};
              }
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ commands }) => {
        return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }));
      },
      unsetLineHeight: () => ({ commands }) => {
        return this.options.types.every((type: string) => commands.resetAttributes(type, 'lineHeight'));
      },
    };
  },
});

export const LetterSpacing = Extension.create({
  name: 'letterSpacing',
  addOptions() {
    return {
      types: ['textStyle'],
      defaultLetterSpacing: 'normal',
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          letterSpacing: {
            default: this.options.defaultLetterSpacing,
            parseHTML: element => element.style.letterSpacing || this.options.defaultLetterSpacing,
            renderHTML: attributes => {
              if (attributes.letterSpacing === this.options.defaultLetterSpacing) {
                return {};
              }
              return { style: `letter-spacing: ${attributes.letterSpacing}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLetterSpacing: (letterSpacing: string) => ({ chain }) => {
        return chain().setMark('textStyle', { letterSpacing }).run();
      },
      unsetLetterSpacing: () => ({ chain }) => {
        return chain().setMark('textStyle', { letterSpacing: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

export const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',
  addOptions() {
    return {
      types: ['paragraph'],
      defaultParagraphSpacing: '0',
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          marginBottom: {
            default: this.options.defaultParagraphSpacing,
            parseHTML: element => element.style.marginBottom || this.options.defaultParagraphSpacing,
            renderHTML: attributes => {
              if (attributes.marginBottom === this.options.defaultParagraphSpacing) {
                return {};
              }
              return { style: `margin-bottom: ${attributes.marginBottom}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setParagraphSpacing: (marginBottom: string) => ({ commands }) => {
        return commands.updateAttributes('paragraph', { marginBottom });
      },
      unsetParagraphSpacing: () => ({ commands }) => {
        return commands.resetAttributes('paragraph', 'marginBottom');
      },
    };
  },
});

export const Indent = Extension.create({
  name: 'indent',
  addOptions() {
    return {
      types: ['paragraph', 'heading', 'blockquote'],
      minLevel: 0,
      maxLevel: 8,
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => parseInt(element.style.paddingLeft || '0', 10) / 40 || 0,
            renderHTML: attributes => {
              if (attributes.indent === 0) {
                return {};
              }
              return { style: `padding-left: ${attributes.indent * 40}px` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const indent = node.attrs.indent || 0;
            if (indent < this.options.maxLevel) {
              tr.setNodeMarkup(pos, node.type, { ...node.attrs, indent: indent + 1 });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const indent = node.attrs.indent || 0;
            if (indent > this.options.minLevel) {
              tr.setNodeMarkup(pos, node.type, { ...node.attrs, indent: indent - 1 });
            }
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
    };
  },
});

