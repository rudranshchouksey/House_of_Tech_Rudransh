# Design Document

## UI/UX Overview

The application features a modern, notion-like interface designed for distraction-free writing, seamless collaboration, and accessible AI assistance. The interface is highly responsive and supports both light and dark themes.

## Component Architecture

- **Editor Core (`RichTextEditor.tsx`):** The central component integrating Tiptap, Yjs for collaboration, and various extensions (slash commands, bubble menu).
- **Toolbars & Menus:**
  - `EditorToolbar.tsx`: Static top toolbar for text formatting (bold, italic, alignment, lists).
  - `FloatingMenu.tsx` & Bubble Menu: Contextual menus that appear based on text selection or cursor position, reducing UI clutter.
  - `CommandPalette.tsx`: Global command palette triggered by shortcuts for quick navigation and actions.
  - `SlashCommandList.tsx`: In-editor command menu triggered by `/` for quickly inserting blocks (headings, tables, lists).
- **Navigation & Layout:**
  - `AiSidebar.tsx`: A collapsible sidebar providing AI context, chat assistance, and document summarization.
  - `DocumentList.tsx`: Dashboard view managing user's documents (recent, favorites, archived).
  - `Header.tsx` & `Footer.tsx`: Standard layout components containing branding, user profile, and theme toggles.
- **Document History (`VersionTimeline.tsx`):** A visual timeline allowing users to navigate through document snapshots and commit messages.

## Design System

- **Styling:** Tailwind CSS v4 is used for atomic utility classes. The `@tailwindcss/typography` plugin ensures highly readable, well-proportioned rich text formatting out of the box.
- **Interactive Elements:** Headless UI (`@headlessui/react`) is utilized for accessible, unstyled interactive components like modals, dropdowns, and popovers, which are then styled with Tailwind.
- **Icons:** `lucide-react` provides a clean, consistent iconography set across the application.
- **Feedback & Notifications:** `sonner` is used for non-intrusive toast notifications (e.g., "Document saved", "Sync failed").
- **Theming:** `next-themes` manages the `dark` class on the HTML body, allowing seamless switching between light and dark modes with a `ThemeProvider.tsx`.
- **Custom Typography:** A dedicated `typography.ts` lib module customizes font sizing, leading, and spacing to match premium editorial standards.
