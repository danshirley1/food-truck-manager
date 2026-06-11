import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { moderateText } from './moderate-text';

describe('moderateText', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns allowed when moderation is disabled', async () => {
    process.env.TEXT_MODERATION_ENABLED = 'false';

    const result = await moderateText('anything goes');
    expect(result.allowed).toBe(true);
  });

  it('blocks empty text via rules without calling remote APIs', async () => {
    process.env.TEXT_MODERATION_ENABLED = 'true';
    process.env.TEXT_MODERATION_PROVIDER = 'rules-only';

    const result = await moderateText('   ');
    expect(result.allowed).toBe(false);
    expect(result.provider).toBe('rules');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('allows non-empty text in rules-only mode without remote APIs', async () => {
    process.env.TEXT_MODERATION_ENABLED = 'true';
    process.env.TEXT_MODERATION_PROVIDER = 'rules-only';

    const result = await moderateText('galaxy glitter ramen');
    expect(result.allowed).toBe(true);
    expect(result.provider).toBe('rules');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('blocks when Hugging Face returns a high toxic score', async () => {
    process.env.TEXT_MODERATION_ENABLED = 'true';
    process.env.TEXT_MODERATION_PROVIDER = 'huggingface';
    process.env.HUGGINGFACE_API_KEY = 'hf_test';
    process.env.TEXT_MODERATION_THRESHOLD = '0.5';

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { label: 'toxic', score: 0.91 },
        { label: 'non-toxic', score: 0.09 },
      ],
    } as Response);

    const result = await moderateText('some edgy text');
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.provider).toBe('huggingface');
    }
  });

  it('allows creative food when Hugging Face scores are low', async () => {
    process.env.TEXT_MODERATION_ENABLED = 'true';
    process.env.TEXT_MODERATION_PROVIDER = 'huggingface';
    process.env.HUGGINGFACE_API_KEY = 'hf_test';

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { label: 'non-toxic', score: 0.97 },
        { label: 'toxic', score: 0.03 },
      ],
    } as Response);

    const result = await moderateText('burnt toast taco');
    expect(result.allowed).toBe(true);
  });

  it('fails open when Hugging Face is unavailable and OpenAI key is missing', async () => {
    process.env.TEXT_MODERATION_ENABLED = 'true';
    process.env.TEXT_MODERATION_PROVIDER = 'huggingface';
    process.env.HUGGINGFACE_API_KEY = 'hf_test';
    delete process.env.OPENAI_API_KEY;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => 'unavailable',
    } as Response);

    const result = await moderateText('galaxy ramen');
    expect(result.allowed).toBe(true);
  });
});
