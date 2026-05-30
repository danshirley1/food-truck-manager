/**
 * POST /api/scenarios/generate — AI-generated scenario for the current turn.
 */

import { ScenarioContextSchema } from '@/lib/types/validation';
import { generateScenario } from '@/lib/ai/generate-scenario';
import { assertOpenAiConfigured } from '@/lib/ai/provider';
import { checkRateLimit, getRateLimitKey } from '@/lib/ai/rate-limit';
import { isDevLlmDebugEnabled } from '@/lib/types/llm-dev-debug';

export async function POST(request: Request) {
  try {
    assertOpenAiConfigured();

    const rateKey = getRateLimitKey(request);
    const rate = checkRateLimit(rateKey);

    if (!rate.allowed) {
      return Response.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          retryAfterSec: rate.retryAfterSec,
        },
        {
          status: 429,
          headers: rate.retryAfterSec
            ? { 'Retry-After': String(rate.retryAfterSec) }
            : undefined,
        }
      );
    }

    const body = await request.json();
    const parsed = ScenarioContextSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: 'Invalid scenario context',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { scenario, dev } = await generateScenario(parsed.data);

    return Response.json({
      success: true,
      scenario,
      ...(isDevLlmDebugEnabled() && dev ? { dev } : {}),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate scenario';
    console.error('[API] POST /api/scenarios/generate error:', message);

    const status = message.includes('OPENAI_API_KEY') ? 503 : 500;

    return Response.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}
