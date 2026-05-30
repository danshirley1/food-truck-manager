/**
 * Resolve menu dish photos via OpenAI web search (Responses API).
 * URLs are verified with HTTP before use — hallucinated links are retried per dish.
 */

import { z } from 'zod';
import type { LlmDevDebug } from '../types/llm-dev-debug';
import { isDevLlmDebugEnabled } from '../types/llm-dev-debug';

const RESPONSES_API = 'https://api.openai.com/v1/responses';
const USER_AGENT = 'FoodTruckManager/1.0 (menu image lookup)';

const MenuImagesResponseSchema = z.object({
  images: z.array(
    z.object({
      label: z.string().min(1),
      imageUrl: z
        .string()
        .url()
        .refine((url) => url.startsWith('https://'), 'imageUrl must use HTTPS'),
    })
  ),
});

const MENU_IMAGES_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['images'],
  properties: {
    images: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'imageUrl'],
        properties: {
          label: { type: 'string' },
          imageUrl: { type: 'string' },
        },
      },
    },
  },
} as const;

interface MenuImageRequest {
  label: string;
  imageSearchTerm?: string;
}

interface ResponsesOutputPart {
  type?: string;
  text?: string;
}

interface ResponsesOutputItem {
  type?: string;
  content?: ResponsesOutputPart[];
}

interface ResponsesApiResult {
  output_text?: string;
  output?: ResponsesOutputItem[];
}

type MenuImageSearchDebug = NonNullable<LlmDevDebug['menuImageSearch']>;

interface VerifiedImage {
  label: string;
  imageUrl: string;
  verified: boolean;
  source: 'batch' | 'retry';
}

function searchModel(): string {
  return process.env.OPENAI_SEARCH_MODEL?.trim() || 'gpt-4o-mini';
}

/** Turn gallery/page URLs from search into direct image CDN links when possible. */
export function normalizeImageUrl(url: string): string {
  const trimmed = url.trim();

  const pexelsPage = trimmed.match(/pexels\.com\/photo\/(?:[^/]+-)?(\d+)/i);
  if (pexelsPage) {
    const id = pexelsPage[1];
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=512`;
  }

  const unsplashPage = trimmed.match(/unsplash\.com\/photos\/([a-zA-Z0-9_-]+)/i);
  if (unsplashPage) {
    return `https://images.unsplash.com/photo-${unsplashPage[1]}?auto=format&fit=crop&w=512&q=80`;
  }

  return trimmed;
}

function buildBatchSearchPrompt(items: MenuImageRequest[]): string {
  const dishList = items
    .map(
      (item, i) =>
        `${i + 1}. "${item.label}" — search for: ${item.imageSearchTerm?.trim() || item.label}`
    )
    .join('\n');

  return `Use web search to find a direct HTTPS image URL for each food dish below.

Rules:
- STRONGLY prefer images.pexels.com direct CDN URLs (e.g. https://images.pexels.com/photos/12345/pexels-photo-12345.jpeg)
- imageUrl MUST return HTTP 200 as an image — do NOT guess or construct Wikimedia URLs
- Do NOT return gallery pages (pexels.com/photo/...) — only direct image file URLs
- The photo must clearly depict that specific dish
- Return exactly ${items.length} entries with matching label text

Dishes:
${dishList}`;
}

function buildSingleSearchPrompt(item: MenuImageRequest): string {
  const term = item.imageSearchTerm?.trim() || item.label;
  return `Use web search to find ONE direct HTTPS food photo URL for "${item.label}" (${term}).

Rules:
- Prefer images.pexels.com direct CDN links ending in .jpeg or .jpg
- URL must be a direct image file that returns HTTP 200 — never guess Wikimedia paths
- If you find a pexels.com/photo/PAGE url, use the images.pexels.com CDN form instead
- Return JSON only: {"imageUrl":"..."}`;
}

function extractOutputText(data: ResponsesApiResult): string | undefined {
  if (data.output_text?.trim()) return data.output_text;

  for (const item of data.output ?? []) {
    if (item.type !== 'message') continue;
    for (const part of item.content ?? []) {
      if (part.type === 'output_text' && part.text?.trim()) {
        return part.text;
      }
    }
  }

  return undefined;
}

function parseImagesJson(text: string): z.infer<typeof MenuImagesResponseSchema> {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith('{')
    ? trimmed
    : trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim();

  if (!jsonText) {
    throw new Error('No JSON object found in web search response');
  }

  const parsed = MenuImagesResponseSchema.safeParse(JSON.parse(jsonText));
  if (!parsed.success) {
    throw new Error(`Invalid web search image JSON: ${parsed.error.message}`);
  }

  return parsed.data;
}

function parseSingleImageUrl(text: string): string | undefined {
  const trimmed = text.trim();
  try {
    const obj = JSON.parse(trimmed) as { imageUrl?: string };
    if (obj.imageUrl?.startsWith('https://')) return obj.imageUrl;
  } catch {
    const match = trimmed.match(/"imageUrl"\s*:\s*"(https:[^"]+)"/);
    return match?.[1];
  }
  return undefined;
}

export async function verifyImageUrl(url: string): Promise<boolean> {
  const normalized = normalizeImageUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    let response = await fetch(normalized, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
    });

    if (response.status === 405 || response.status === 501 || response.status === 403) {
      response = await fetch(normalized, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT, Range: 'bytes=0-512' },
        redirect: 'follow',
      });
    }

    if (!response.ok) return false;
    const contentType = response.headers.get('content-type') ?? '';
    return contentType.startsWith('image/');
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function callWebSearch(
  input: string,
  schema: 'batch' | 'single'
): Promise<{ text: string; raw: unknown }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const body: Record<string, unknown> = {
    model: searchModel(),
    tools: [{ type: 'web_search', search_context_size: 'medium' }],
    tool_choice: 'required',
    input,
    store: false,
  };

  if (schema === 'batch') {
    body.text = {
      format: {
        type: 'json_schema',
        name: 'menu_dish_images',
        strict: true,
        schema: MENU_IMAGES_JSON_SCHEMA,
      },
    };
  } else {
    body.text = {
      format: {
        type: 'json_schema',
        name: 'single_dish_image',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['imageUrl'],
          properties: { imageUrl: { type: 'string' } },
        },
      },
    };
  }

  const response = await fetch(RESPONSES_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const responseBody = await response.text();
  let raw: unknown;
  try {
    raw = JSON.parse(responseBody);
  } catch {
    raw = responseBody;
  }

  if (!response.ok) {
    throw new Error(`OpenAI web search error ${response.status}: ${responseBody}`);
  }

  const text = extractOutputText(raw as ResponsesApiResult);
  if (!text) throw new Error('Empty response from OpenAI web search');

  return { text, raw };
}

async function resolveVerifiedUrl(
  label: string,
  candidate: string | undefined,
  source: 'batch' | 'retry'
): Promise<VerifiedImage | undefined> {
  if (!candidate) return undefined;

  const imageUrl = normalizeImageUrl(candidate);
  const verified = await verifyImageUrl(imageUrl);
  return { label, imageUrl, verified, source };
}

async function searchSingleDishImage(item: MenuImageRequest): Promise<VerifiedImage | undefined> {
  const { text } = await callWebSearch(buildSingleSearchPrompt(item), 'single');
  const imageUrl = parseSingleImageUrl(text);
  return resolveVerifiedUrl(item.label, imageUrl, 'retry');
}

function matchImageUrl(label: string, byLabel: Map<string, string>): string | undefined {
  const exact = byLabel.get(label.trim().toLowerCase());
  if (exact) return exact;

  for (const [key, url] of byLabel.entries()) {
    if (label.toLowerCase().includes(key) || key.includes(label.toLowerCase())) {
      return url;
    }
  }

  return undefined;
}

export async function attachMenuImageUrls<
  T extends {
    menuOptions: Array<{ label: string; imageSearchTerm?: string; imageUrl?: string }>;
  },
>(scenario: T): Promise<{ scenario: T; menuImageDebug?: MenuImageSearchDebug }> {
  const model = searchModel();
  const batchPrompt = buildBatchSearchPrompt(scenario.menuOptions);

  try {
    const { text: batchText, raw: rawResponsesApi } = await callWebSearch(
      batchPrompt,
      'batch'
    );
    const parsed = parseImagesJson(batchText);

    const byLabel = new Map<string, string>();
    for (const image of parsed.images) {
      byLabel.set(image.label.trim().toLowerCase(), normalizeImageUrl(image.imageUrl));
    }

    const verificationLog: VerifiedImage[] = [];
    const menuOptions = [];

    for (const option of scenario.menuOptions) {
      let result = await resolveVerifiedUrl(
        option.label,
        matchImageUrl(option.label, byLabel),
        'batch'
      );

      if (!result?.verified) {
        result = (await searchSingleDishImage(option)) ?? result;
      }

      if (result) verificationLog.push(result);

      menuOptions.push(
        result?.verified ? { ...option, imageUrl: result.imageUrl } : option
      );
    }

    return {
      scenario: { ...scenario, menuOptions },
      menuImageDebug: isDevLlmDebugEnabled()
        ? {
            model,
            prompt: batchPrompt,
            rawResponsesApi,
            extractedText: batchText,
            parsedImages: { raw: parsed, verificationLog },
          }
        : undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[menu-image] web search failed, menu cards will use placeholders:', message);
    return {
      scenario,
      menuImageDebug: isDevLlmDebugEnabled()
        ? { model, prompt: batchPrompt, error: message }
        : undefined,
    };
  }
}
