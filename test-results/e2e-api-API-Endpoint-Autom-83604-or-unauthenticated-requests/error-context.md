# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\api.spec.ts >> API Endpoint Automation Tests >> Document API Endpoints (Requires Auth) >> POST /api/documents/[id]/sync returns 401 Unauthorized for unauthenticated requests
- Location: e2e\api.spec.ts:21:9

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED 127.0.0.1:3001
Call log:
  - → POST http://127.0.0.1:3001/api/documents/test-doc-id-123/sync
    - user-agent: Playwright/1.61.1 (x64; windows 10.0) node/24.15
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Content-Type: application/octet-stream
    - content-length: 19

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('API Endpoint Automation Tests', () => {
  4  |   const baseURL = 'http://127.0.0.1:3001';
  5  |   const documentId = 'test-doc-id-123';
  6  |   const versionId = 'test-version-id-456';
  7  | 
  8  |   test.describe('Document API Endpoints (Requires Auth)', () => {
  9  |     test('GET /api/documents/[id]/versions returns 401 Unauthorized for unauthenticated requests', async ({ request }) => {
  10 |       const response = await request.get(`${baseURL}/api/documents/${documentId}/versions`);
  11 |       expect([401, 403]).toContain(response.status());
  12 |     });
  13 | 
  14 |     test('POST /api/documents/[id]/versions returns 401 Unauthorized for unauthenticated requests', async ({ request }) => {
  15 |       const response = await request.post(`${baseURL}/api/documents/${documentId}/versions`, {
  16 |         data: { message: 'Test version snapshot' }
  17 |       });
  18 |       expect([401, 403]).toContain(response.status());
  19 |     });
  20 | 
  21 |     test('POST /api/documents/[id]/sync returns 401 Unauthorized for unauthenticated requests', async ({ request }) => {
  22 |       const binaryDelta = new Uint8Array([1, 2, 3]);
> 23 |       const response = await request.post(`${baseURL}/api/documents/${documentId}/sync`, {
     |                                      ^ Error: apiRequestContext.post: connect ECONNREFUSED 127.0.0.1:3001
  24 |         data: binaryDelta,
  25 |         headers: {
  26 |           'Content-Type': 'application/octet-stream'
  27 |         }
  28 |       });
  29 |       expect([401, 403]).toContain(response.status());
  30 |     });
  31 | 
  32 |     test('POST /api/documents/[id]/versions/[versionId]/summarize returns 401 Unauthorized for unauthenticated requests', async ({ request }) => {
  33 |       const response = await request.post(`${baseURL}/api/documents/${documentId}/versions/${versionId}/summarize`);
  34 |       expect([401, 403]).toContain(response.status());
  35 |     });
  36 |   });
  37 | 
  38 |   test.describe('AI Endpoints Validation', () => {
  39 |     test('POST /api/ai/autocomplete rejects large payloads (400 Bad Request)', async ({ request }) => {
  40 |       // Testing the Zod validation limits we added
  41 |       const massivePrompt = 'A'.repeat(6000); // Max is 5000
  42 |       
  43 |       const response = await request.post(`${baseURL}/api/ai/autocomplete`, {
  44 |         data: { prompt: massivePrompt }
  45 |       });
  46 |       
  47 |       expect(response.status()).toBe(400);
  48 |     });
  49 | 
  50 |     test('POST /api/ai/autocomplete accepts valid payloads and initiates a stream', async ({ request }) => {
  51 |       const response = await request.post(`${baseURL}/api/ai/autocomplete`, {
  52 |         data: { prompt: 'Test context string.' }
  53 |       });
  54 |       
  55 |       // Either 200 OK (Stream) or 500/etc if OpenAI key fails or streaming errors
  56 |       expect([200, 500]).toContain(response.status());
  57 |     });
  58 |   });
  59 | });
  60 | 
```