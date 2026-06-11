/**
 * POST /api/signature-dish/generate — AI image for a player-defined Signature Dish.
 */

import { z } from 'zod';
import { assertOpenAiConfigured } from '@/lib/ai/provider';
import {
  generateSignatureDishImage,
  isSignatureDishImagesEnabled,
} from '@/lib/ai/generate-signature-dish-image';
import { checkRateLimit, getRateLimitKey } from '@/lib/ai/rate-limit';
import {
  moderateText,
  MODERATION_BLOCKED_USER_MESSAGE,
} from '@/lib/moderation';

const BodySchema = z.object({
  description: z.string().trim().min(1).max(200),
  turn: z.number().int().min(1).max(99),
});

export async function POST(request: Request) {
  try {
    assertOpenAiConfigured();

    if (!isSignatureDishImagesEnabled()) {
      return Response.json(
        { success: false, error: 'Signature dish image generation is disabled' },
        { status: 503 }
      );
    }

    const rateKey = getRateLimitKey(request);
    const rate = checkRateLimit(rateKey);

    if (!rate.allowed) {
      return Response.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          retryAfterSec: rate.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const body = BodySchema.safeParse(await request.json());
    if (!body.success) {
      return Response.json(
        { success: false, error: 'Invalid request — description required (max 200 chars)' },
        { status: 400 }
      );
    }

    const moderation = await moderateText(body.data.description);

    if (!moderation.allowed) {
      const payload: Record<string, unknown> = {
        success: false,
        error: MODERATION_BLOCKED_USER_MESSAGE,
        errorCode: 'content_moderation',
        moderation: {
          provider: moderation.provider,
          labels: moderation.labels,
          scores: moderation.scores,
        },
      };

      if (process.env.NODE_ENV === 'development') {
        payload.dev = {
          moderation,
        };
      }

      return Response.json(payload, { status: 422 });
    }

    const result = await generateSignatureDishImage(body.data.description);

    if (!result.ok) {
      const status =
        result.code === 'content_policy_violation'
          ? 422
          : result.code === 'rate_limit'
            ? 429
            : result.code === 'billing' || result.code === 'invalid_request'
              ? 400
              : 502;

      const payload: Record<string, unknown> = {
        success: false,
        error: result.userMessage,
        errorCode: result.code,
      };

      if (process.env.NODE_ENV === 'development') {
        payload.dev = {
          model: result.model,
          openAiMessage: result.openAiMessage,
          httpStatus: result.httpStatus,
          rawError: result.rawError,
        };
      }

      return Response.json(payload, { status });
    }

    return Response.json({
      success: true,
      imageUrl: result.imageUrl,
      turn: body.data.turn,
      description: body.data.description,
      ...(process.env.NODE_ENV === 'development' && {
        dev: {
          model: result.model,
          moderation,
        },
      }),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate signature dish image';
    console.error('[API] POST /api/signature-dish/generate error:', message);

    const status = message.includes('OPENAI_API_KEY') ? 503 : 500;
    return Response.json({ success: false, error: message }, { status });
  }
}
