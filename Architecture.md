# System Architecture

## High-Level Architecture

The application is built on a modern full-stack serverless architecture using the **Next.js App Router**, which heavily leverages React Server Components (RSCs) and Server Actions for optimized data fetching and mutations, alongside Client Components for rich interactivity.

## Data Layer & Persistence

- **Database:** PostgreSQL serves as the primary source of truth.
- **ORM:** Prisma is used for type-safe database access and schema management.
- **Schema Design (`schema.prisma`):**
  - **User & Auth:** `User`, `Account`, `Session`, `VerificationToken` models managed by NextAuth.js.
  - **Document:** Stores metadata (title, owner, timestamps). The actual rich-text content is stored as a `Bytes` blob. This blob represents the binary format of the Yjs document state, which is crucial for CRDT-based merging.
  - **Collaboration:** `DocumentCollaborator` handles role-based access control (OWNER, EDITOR, VIEWER).
  - **Versioning:** `DocumentVersion` stores historical binary snapshots (`snapshotBlob`) and commit messages for version control.

## Real-Time Collaboration Engine

The collaborative editing capability is built around Conflict-free Replicated Data Types (CRDTs).
- **Yjs:** Core CRDT implementation for resolving concurrent edits.
- **y-prosemirror:** Bridges the Tiptap (ProseMirror) editor state with the Yjs document state.
- **Synchronization:** The application uses a custom sync engine (`src/hooks/useSyncEngine.ts` and `src/lib/sync/`) that synchronizes local Yjs updates with the server.

## Offline Support & Local First

- **IndexedDB:** The `dexie` library is used to cache the Yjs document state locally in the browser.
- **Flow:** 
  1. When a user makes an edit, it is instantly applied to the local Yjs document and the UI updates.
  2. The update is persisted locally to IndexedDB via Dexie.
  3. The `useSyncEngine` attempts to sync the Yjs binary update to the backend API.
  4. If offline, updates queue locally and sync automatically upon reconnection.

## AI Integration

- **Vercel AI SDK:** Provides the infrastructure for streaming LLM responses.
- **OpenAI:** Used as the primary language model provider (`@ai-sdk/openai`).
- **Implementation:** Next.js Route Handlers (`src/app/api/...`) process AI requests securely on the server and stream the response text chunks directly to the client's `RichTextEditor` or `AiSidebar`.

## Testing Strategy

- **Unit Testing:** Vitest (`vitest.config.ts`, `vitest.setup.ts`) with React Testing Library tests isolated business logic, hooks, and individual UI components.
- **End-to-End (E2E) Testing:** Playwright (`@playwright/test`) is configured in the `e2e/` directory to test critical user flows like authentication, collaborative editing, and offline sync in real browser environments.
