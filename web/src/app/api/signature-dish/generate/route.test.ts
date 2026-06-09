import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/moderation', () => ({
  moderateText: vi.fn(),
  MODERATION_BLOCKED_USER_MESSAGE:
    "That description doesn't fit our family-friendly kitchen — try another dish idea.",
}));

vi.mock('@/lib/ai/generate-signature-dish-image', () => ({
  isSignatureDishImagesEnabled: vi.fn(() => true),
  generateSignatureDishImage: vi.fn(async () => ({
    ok: true,
    imageUrl: 'https://example.com/dish.png',
    model: 'test-model',
  })),
}));

vi.mock('@/lib/ai/provider', () => ({
  assertOpenAiConfigured: vi.fn(),
}));

vi.mock('@/lib/ai/rate-limit', () => ({
  getRateLimitKey: vi.fn(() => 'test-key'),
  checkRateLimit: vi.fn(() => ({ allowed: true, retryAfterSec: 0 })),
}));

import { POST } from './route';
import { moderateText } from '@/lib/moderation';
import { generateSignatureDishImage } from '@/lib/ai/generate-signature-dish-image';

describe('POST /api/signature-dish/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 422 when moderation blocks the description', async () => {
    vi.mocked(moderateText).mockResolvedValue({
      allowed: false,
      provider: 'huggingface',
      reason: 'Model flagged content (toxic)',
      labels: ['toxic'],
    });

    const request = new Request('http://localhost/api/signature-dish/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'bad words here', turn: 1 }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.errorCode).toBe('content_moderation');
    expect(body.success).toBe(false);
    expect(generateSignatureDishImage).not.toHaveBeenCalled();
  });

  it('generates an image when moderation allows the description', async () => {
    vi.mocked(moderateText).mockResolvedValue({
      allowed: true,
      provider: 'huggingface',
      scores: { 'non-toxic': 0.98 },
    });

    const request = new Request('http://localhost/api/signature-dish/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'galaxy glitter ramen', turn: 2 }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.imageUrl).toBe('https://example.com/dish.png');
    expect(generateSignatureDishImage).toHaveBeenCalledWith('galaxy glitter ramen');
  });
});
