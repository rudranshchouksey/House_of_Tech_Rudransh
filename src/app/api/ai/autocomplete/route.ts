import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = streamText({
      model: openai('gpt-4o-mini'),
      prompt: `Continue the following text naturally based on its context. Respond only with the exact continuation string, do not include pleasantries or conversational filler.\n\nText Context: "${prompt}"`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
}
