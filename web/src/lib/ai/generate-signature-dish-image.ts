/**
 * OpenAI image generation for player-defined Signature Dish creations.
 */

const GPT_IMAGE_MODELS = new Set(['gpt-image-1', 'gpt-image-1-mini', 'gpt-image-1.5']);
const IMAGE_MODEL_FALLBACKS = ['gpt-image-1-mini', 'dall-e-2', 'gpt-image-1'] as const;
const DEFAULT_IMAGE_MODEL = 'gpt-image-1-mini';

export type SignatureDishImageErrorCode =
  | 'content_policy_violation'
  | 'rate_limit'
  | 'billing'
  | 'invalid_request'
  | 'api_error'
  | 'unknown';

export type SignatureDishImageResult =
  | { ok: true; imageUrl: string; model: string }
  | {
      ok: false;
      userMessage: string;
      code: SignatureDishImageErrorCode;
      openAiMessage?: string;
      httpStatus?: number;
      model?: string;
      rawError?: unknown;
    };

interface OpenAiErrorJson {
  error?: {
    message?: string;
    type?: string;
    code?: string | null;
  };
}

export function isSignatureDishImagesEnabled(): boolean {
  return process.env.SIGNATURE_DISH_IMAGES_ENABLED !== 'false';
}

function imageModelsToTry(): string[] {
  const preferred = process.env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL;
  const ordered = [preferred, ...IMAGE_MODEL_FALLBACKS.filter((m) => m !== preferred)];
  return [...new Set(ordered)];
}

function buildImageRequestBody(model: string, prompt: string): Record<string, unknown> {
  if (GPT_IMAGE_MODELS.has(model)) {
    return {
      model,
      prompt: prompt.slice(0, 4000),
      n: 1,
      size: '1024x1024',
      quality: 'low',
      output_format: 'webp',
    };
  }

  return {
    model: 'dall-e-2',
    prompt: prompt.slice(0, 1000),
    n: 1,
    size: '512x512',
    response_format: 'url',
  };
}

function parseImageResponse(
  data: { data?: Array<{ url?: string; b64_json?: string }> },
  outputFormat: string
): string | undefined {
  const item = data.data?.[0];
  if (item?.url) return item.url;
  if (item?.b64_json) {
    const mime = outputFormat === 'jpeg' ? 'jpeg' : outputFormat === 'webp' ? 'webp' : 'png';
    return `data:image/${mime};base64,${item.b64_json}`;
  }
  return undefined;
}

function userMessageForCode(
  code: SignatureDishImageErrorCode,
  openAiMessage?: string
): string {
  switch (code) {
    case 'content_policy_violation':
      return (
        openAiMessage ??
        'Rejected by OpenAI content safety — try a different description.'
      );
    case 'rate_limit':
      return openAiMessage ?? 'Image service rate limit — try again in a moment.';
    case 'billing':
      return 'Image generation unavailable (billing limit).';
    case 'invalid_request':
      return openAiMessage ?? 'Invalid image request — check your description and try again.';
    case 'api_error':
      return openAiMessage ?? 'Image service error — try again in a moment.';
    default:
      return openAiMessage ?? 'Image generation failed — try again in a moment.';
  }
}

export function parseOpenAiImageError(
  httpStatus: number,
  bodyText: string
): Omit<Extract<SignatureDishImageResult, { ok: false }>, 'ok' | 'model'> {
  let openAiMessage: string | undefined;
  let code: SignatureDishImageErrorCode = 'unknown';
  let rawError: unknown = bodyText;

  try {
    const parsed = JSON.parse(bodyText) as OpenAiErrorJson;
    rawError = parsed;
    openAiMessage = parsed.error?.message?.trim();
    const openAiCode = parsed.error?.code?.toLowerCase() ?? '';
    const messageLower = openAiMessage?.toLowerCase() ?? '';

    if (
      openAiCode === 'content_policy_violation' ||
      messageLower.includes('safety system') ||
      messageLower.includes('content policy') ||
      messageLower.includes('not allowed')
    ) {
      code = 'content_policy_violation';
    } else if (openAiCode === 'rate_limit_exceeded' || httpStatus === 429) {
      code = 'rate_limit';
    } else if (openAiCode.includes('billing') || messageLower.includes('billing')) {
      code = 'billing';
    } else if (httpStatus >= 500) {
      code = 'api_error';
    } else if (httpStatus >= 400) {
      code = 'invalid_request';
    }
  } catch {
    if (httpStatus >= 500) code = 'api_error';
    else if (httpStatus >= 400) code = 'invalid_request';
  }

  return {
    userMessage: userMessageForCode(code, openAiMessage),
    code,
    openAiMessage,
    httpStatus,
    rawError,
  };
}

function isNonRetryableCode(code: SignatureDishImageErrorCode): boolean {
  return (
    code === 'content_policy_violation' ||
    code === 'billing' ||
    code === 'invalid_request'
  );
}

export function buildSignatureDishPrompt(description: string): string {
  return [
    'Professional appetizing food photography',
    description,
    'medium wide shot, full dish visible on plate or tray',
    'natural light, no text, no people, no logos, no watermark',
  ].join(', ');
}

export async function generateSignatureDishImage(
  description: string
): Promise<SignatureDishImageResult> {
  if (!isSignatureDishImagesEnabled()) {
    return {
      ok: false,
      code: 'unknown',
      userMessage: 'Signature dish image generation is disabled',
    };
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      code: 'unknown',
      userMessage: 'Image generation is not configured',
    };
  }

  const prompt = buildSignatureDishPrompt(description.trim());
  let lastFailure: Extract<SignatureDishImageResult, { ok: false }> | undefined;

  for (const model of imageModelsToTry()) {
    try {
      const body = buildImageRequestBody(model, prompt);
      const outputFormat =
        typeof body.output_format === 'string' ? body.output_format : 'png';

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const parsed = parseOpenAiImageError(response.status, errorBody);
        lastFailure = { ok: false, ...parsed, model };
        console.warn(`[signature-dish] ${model} failed:`, response.status, errorBody);

        if (isNonRetryableCode(parsed.code)) {
          return lastFailure;
        }
        continue;
      }

      const data = (await response.json()) as {
        data?: Array<{ url?: string; b64_json?: string }>;
      };

      const url = parseImageResponse(data, outputFormat);
      if (url) {
        console.log(`[signature-dish] success with model ${model}`);
        return { ok: true, imageUrl: url, model };
      }

      lastFailure = {
        ok: false,
        code: 'api_error',
        userMessage: 'Image service returned an empty response',
        httpStatus: response.status,
        model,
        rawError: data,
      };
    } catch (err) {
      console.warn(`[signature-dish] ${model} request failed:`, err);
      lastFailure = {
        ok: false,
        code: 'api_error',
        userMessage: 'Image service request failed — try again in a moment',
        model,
        openAiMessage: err instanceof Error ? err.message : undefined,
      };
    }
  }

  return (
    lastFailure ?? {
      ok: false,
      code: 'unknown',
      userMessage: 'Image generation failed — try again in a moment',
    }
  );
}
