import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateSystemPrompt } from '@/lib/prompts';
import { validateInput } from '@/lib/validators';
import { InputType, DocType, ToneType } from '@/lib/store';

// Set runtime config to edge or standard serverless (standard is fine for Node.js 18)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { input, inputType, documentationType, tone, language } = body as {
      input: string;
      inputType: InputType;
      documentationType: DocType;
      tone: ToneType;
      language: string;
    };

    // 1. Validate inputs
    const validation = validateInput(input, inputType);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.message, code: 'INVALID_INPUT' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Load API key (check client override header first, then fall back to env variable)
    let apiKey = req.headers.get('x-gemini-key') || '';
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    }

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return new Response(
        JSON.stringify({
          error: 'Gemini API Key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY in your Vercel Dashboard or configure it in the Settings modal.',
          code: 'AUTH_ERROR',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Generate dynamic system prompt and configure Gemini
    const systemPrompt = generateSystemPrompt(inputType, documentationType, tone, language);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 4. Set up ReadableStream for Server-Sent Events (SSE)
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const resultStream = await model.generateContentStream({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nInput:\n${input}` }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          });

          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              const data = JSON.stringify({ status: 'generating', content: chunkText });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
          }

          // Signal completion
          const completeData = JSON.stringify({ status: 'complete' });
          controller.enqueue(new TextEncoder().encode(`data: ${completeData}\n\n`));
        } catch (streamError) {
          console.error('Generative AI streaming error:', streamError);
          const errMessage = (streamError as Error).message || 'Failed to stream response from Gemini.';
          const errorData = JSON.stringify({ status: 'error', message: errMessage });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none',
      },
    });
  } catch (error) {
    console.error('Server endpoint error:', error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || 'An unexpected server error occurred.',
        code: 'SERVER_ERROR',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
