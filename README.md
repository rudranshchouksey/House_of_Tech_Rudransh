# AI-Powered Collaborative Rich Text Editor

A modern, full-stack collaborative document editor built with Next.js, Tiptap, Yjs, and the Vercel AI SDK. It features real-time collaboration, offline support, version history, and AI-assisted writing.

## Key Features

- **Rich Text Editing:** Built on Tiptap and ProseMirror, featuring floating menus, slash commands, tables, task lists, and comprehensive text formatting.
- **Real-Time Collaboration:** Powered by Yjs CRDTs, allowing multiple users to edit the same document concurrently without conflicts.
- **Offline Support:** Uses Dexie.js (IndexedDB) for local caching, enabling offline editing with automatic background synchronization when the connection is restored.
- **AI Assistance:** Integrated with the Vercel AI SDK and OpenAI for intelligent text generation, autocomplete, and an AI chat sidebar.
- **Version Control:** Complete version history with snapshotting, allowing users to view and restore previous document states.
- **Authentication & Authorization:** Secure user authentication via NextAuth.js, with role-based access control (Owner, Editor, Viewer) for documents.
- **Dark Mode:** Built-in theme switching using `next-themes`.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Editor:** Tiptap, ProseMirror
- **Collaboration:** Yjs, y-prosemirror
- **AI:** Vercel AI SDK, OpenAI
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** NextAuth.js (v5)
- **Styling:** Tailwind CSS v4, Headless UI, Lucide React
- **Testing:** Playwright (E2E), Vitest (Unit)

## Getting Started

### Prerequisites

- Node.js (v20+)
- PostgreSQL Database
- OpenAI API Key

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/db"
   OPENAI_API_KEY="your-openai-api-key"
   NEXTAUTH_SECRET="your-nextauth-secret"
   ```

3. Run database migrations:
   ```bash
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint.
- `npm run test`: Runs Vitest unit tests.
- `npm run test:e2e`: Runs Playwright E2E tests.
