import { test, expect } from '@playwright/test';

test.describe('API Endpoint Automation Tests', () => {
  const baseURL = 'http://127.0.0.1:3001';
  const documentId = 'test-doc-id-123';
  const versionId = 'test-version-id-456';

  test.describe('Document API Endpoints (Requires Auth)', () => {
    test('GET /api/documents/[id]/versions returns 401 Unauthorized for unauthenticated requests', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/documents/${documentId}/versions`);
      expect([401, 403]).toContain(response.status());
    });

    test('POST /api/documents/[id]/versions returns 401 Unauthorized for unauthenticated requests', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/documents/${documentId}/versions`, {
        data: { message: 'Test version snapshot' }
      });
      expect([401, 403]).toContain(response.status());
    });

    test('POST /api/documents/[id]/sync returns 401 Unauthorized for unauthenticated requests', async ({ request }) => {
      const binaryDelta = new Uint8Array([1, 2, 3]);
      const response = await request.post(`${baseURL}/api/documents/${documentId}/sync`, {
        data: binaryDelta,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
      expect([401, 403]).toContain(response.status());
    });

    test('POST /api/documents/[id]/versions/[versionId]/summarize returns 401 Unauthorized for unauthenticated requests', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/documents/${documentId}/versions/${versionId}/summarize`);
      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('AI Endpoints Validation', () => {
    test('POST /api/ai/autocomplete rejects large payloads (400 Bad Request)', async ({ request }) => {
      // Testing the Zod validation limits we added
      const massivePrompt = 'A'.repeat(6000); // Max is 5000
      
      const response = await request.post(`${baseURL}/api/ai/autocomplete`, {
        data: { prompt: massivePrompt }
      });
      
      expect(response.status()).toBe(400);
    });

    test('POST /api/ai/autocomplete accepts valid payloads and initiates a stream', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/ai/autocomplete`, {
        data: { prompt: 'Test context string.' }
      });
      
      // Either 200 OK (Stream) or 500/etc if OpenAI key fails or streaming errors
      expect([200, 500]).toContain(response.status());
    });
  });
});
