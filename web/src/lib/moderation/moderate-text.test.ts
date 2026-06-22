import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { moderateText } from './moderate-text';

describe('moderateText', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    process.env.TEXT_MODERATION_PROFANITY_CHECK = 'false';
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

  it('blocks profanity via second pass when game model allows (e.g. fuck salad)', async () => {
    process.env.TEXT_MODERATION_ENABLED = 'true';
    process.env.TEXT_MODERATION_PROVIDER = 'huggingface';
    process.env.HUGGINGFACE_API_KEY = 'hf_test';
    process.env.HUGGINGFACE_INFERENCE_ENDPOINT = 'https://custom.endpoint.example';
    process.env.TEXT_MODERATION_PROFANITY_CHECK = 'true';
    process.env.TEXT_MODERATION_THRESHOLD = '0.5';

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { label: 'allowed', score: 0.7 },
          { label: 'blocked', score: 0.3 },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { label: 'obscene', score: 0.92 },
          { label: 'insult', score: 0.15 },
          { label: 'toxic', score: 0.88 },
        ],
      } as Response);

    const result = await moderateText('fuck salad');
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.provider).toBe('profanity-model');
      expect(result.labels).toContain('obscene');
    }
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('allows gross food when profanity pass sees high insult but low obscene', async () => {
    process.env.TEXT_MODERATION_ENABLED = 'true';
    process.env.TEXT_MODERATION_PROVIDER = 'huggingface';
    process.env.HUGGINGFACE_API_KEY = 'hf_test';
    process.env.HUGGINGFACE_INFERENCE_ENDPOINT = 'https://custom.endpoint.example';
    process.env.TEXT_MODERATION_PROFANITY_CHECK = 'true';

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { label: 'allowed', score: 0.96 },
          { label: 'blocked', score: 0.04 },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { label: 'insult', score: 0.49 },
          { label: 'obscene', score: 0.006 },
          { label: 'toxicity', score: 0.57 },
        ],
      } as Response);

    const result = await moderateText('a bowl of cockroaches');
    expect(result.allowed).toBe(true);
  });

  it('allows silly sausages when game model blocks but RoBERTa insult is soft-band', async () => {
    process.env.TEXT_MODERATION_ENABLED = 'true';
    process.env.TEXT_MODERATION_PROVIDER = 'huggingface';
    process.env.HUGGINGFACE_API_KEY = 'hf_test';
    process.env.HUGGINGFACE_INFERENCE_ENDPOINT = 'https://custom.endpoint.example';
    process.env.TEXT_MODERATION_PROFANITY_CHECK = 'true';

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { label: 'allowed', score: 0.13 },
          { label: 'blocked', score: 0.87 },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { label: 'insult', score: 0.964 },
          { label: 'obscene', score: 0 },
          { label: 'toxicity', score: 0.976 },
        ],
      } as Response);

    const result = await moderateText('silly sausages');
    expect(result.allowed).toBe(true);
  });
});
