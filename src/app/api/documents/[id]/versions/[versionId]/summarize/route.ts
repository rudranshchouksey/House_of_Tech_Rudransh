import { NextResponse } from 'next/server';
import { withDocumentAuth } from '@/lib/document-middleware';
import prisma from '@/lib/db';
import { Role } from '@prisma/client';
import * as Y from 'yjs';
import diff from 'fast-diff';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request, context: { params: Promise<{ id: string, versionId: string }> }) {
  const { id, versionId } = await context.params;

  return withDocumentAuth(req, id, Role.VIEWER, async (req, userId) => {
    try {
      const currentDocRecord = await prisma.document.findUnique({ where: { id } });
      const versionRecord = await prisma.documentVersion.findUnique({ where: { id: versionId } });

      if (!currentDocRecord || !versionRecord) {
        return NextResponse.json({ error: 'Document or Version not found' }, { status: 404 });
      }

      const currentDoc = new Y.Doc();
      if (currentDocRecord.content) Y.applyUpdate(currentDoc, new Uint8Array(currentDocRecord.content));
      
      const historicalDoc = new Y.Doc();
      Y.applyUpdate(historicalDoc, new Uint8Array(versionRecord.snapshotBlob));

      const currentText = currentDoc.getXmlFragment('content').toString();
      const historicalText = historicalDoc.getXmlFragment('content').toString();

      const differences = diff(historicalText, currentText);
      let diffSummary = '';
      
      for (const [operation, text] of differences) {
        if (operation === diff.INSERT) diffSummary += `+ ${text}\n`;
        else if (operation === diff.DELETE) diffSummary += `- ${text}\n`;
      }

      if (!diffSummary.trim()) {
        return NextResponse.json({ summary: "No changes detected between these versions." });
      }

      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: `You are an AI assistant. Summarize the following document changes concisely in one or two sentences. \n\nChanges:\n${diffSummary}`,
      });

      return NextResponse.json({ summary: text });
    } catch (error) {
      console.error('[AI_SUMMARIZE_ERROR]', error);
      return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
    }
  });
}
