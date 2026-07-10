import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const autocompleteSchema = z.object({
  prompt: z.string().max(5000, "Context too large")
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = autocompleteSchema.parse(body);

    const result = streamText({
      model: openai('gpt-4o-mini'),
      prompt: `Continue the following text naturally based on its context. Respond only with the exact continuation string, do not include pleasantries or conversational filler.\n\nText Context: "${prompt}"`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: (error as any).errors }), { status: 400 });
    }
    console.error('[AI_AUTOCOMPLETE_ERROR]', error);
    return new Response('Error generating completion', { status: 500 });
  }
}
