/**
 * OpenAI image generation for menu specials.
 */

import { DayContext } from '../types';

const GPT_IMAGE_MODELS = new Set(['gpt-image-1', 'gpt-image-1-mini', 'gpt-image-1.5']);

/** Fastest-first — menu cards are small thumbnails */
const IMAGE_MODEL_FALLBACKS = ['gpt-image-1-mini', 'dall-e-2', 'gpt-image-1'] as const;

const DEFAULT_IMAGE_MODEL = 'gpt-image-1-mini';

export function isMenuImagesEnabled(): boolean {
  return process.env.MENU_IMAGES_ENABLED !== 'false';
}

const IMAGE_FRAMING_SUFFIX =
  'medium wide shot, full dish visible on plate or tray, centered with space around edges, not extreme close-up or macro';

export function buildFallbackImagePrompt(label: string, dayContext: DayContext): string {
  return [
    'Professional appetizing food photography',
    label,
    `setting evokes ${dayContext.location}`,
    'natural light',
    IMAGE_FRAMING_SUFFIX,
    'no text, no people, no logos, no watermark',
  ].join(', ');
}

export function finalizeImagePrompt(prompt: string): string {
  const trimmed = prompt.trim();
  if (trimmed.toLowerCase().includes('wide shot') || trimmed.toLowerCase().includes('full dish')) {
    return trimmed.slice(0, 4000);
  }
  return `${trimmed}, ${IMAGE_FRAMING_SUFFIX}`.slice(0, 4000);
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

  if (model === 'dall-e-3') {
    return {
      model,
      prompt: prompt.slice(0, 4000),
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
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

function imageModelsToTry(): string[] {
  const preferred = process.env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL;
  const ordered = [preferred, ...IMAGE_MODEL_FALLBACKS.filter((m) => m !== preferred)];
  return [...new Set(ordered)];
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

async function tryGenerateWithModel(
  model: string,
  prompt: string
): Promise<string | undefined> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return undefined;

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
    console.warn(`[menu-images] ${model} failed:`, response.status, errorBody);
    return undefined;
  }

  const data = (await response.json()) as {
    data?: Array<{ url?: string; b64_json?: string }>;
  };

  return parseImageResponse(data, outputFormat);
}

export async function generateMenuImage(prompt: string): Promise<string | undefined> {
  for (const model of imageModelsToTry()) {
    try {
      const url = await tryGenerateWithModel(model, prompt);
      if (url) {
        console.log(`[menu-images] success with model ${model}`);
        return url;
      }
    } catch (err) {
      console.warn(`[menu-images] ${model} request failed:`, err);
    }
  }
  return undefined;
}

export async function generateMenuImageForOption(
  label: string,
  imagePrompt: string | undefined,
  dayContext: DayContext
): Promise<string | undefined> {
  if (!isMenuImagesEnabled()) return undefined;

  const rawPrompt =
    imagePrompt?.trim() || buildFallbackImagePrompt(label, dayContext);
  const prompt = finalizeImagePrompt(rawPrompt);
  return generateMenuImage(prompt);
}
