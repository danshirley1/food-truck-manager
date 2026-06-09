import type { ModerationConfig } from './types';

export function getModerationConfig(): ModerationConfig {
  const providerRaw = (process.env.TEXT_MODERATION_PROVIDER ?? 'huggingface').toLowerCase();

  return {
    enabled: process.env.TEXT_MODERATION_ENABLED !== 'false',
    provider:
      providerRaw === 'openai'
        ? 'openai'
        : providerRaw === 'rules-only'
          ? 'rules-only'
          : 'huggingface',
    threshold: parseFloat(process.env.TEXT_MODERATION_THRESHOLD ?? '0.5'),
    huggingFaceApiKey: process.env.HUGGINGFACE_API_KEY,
    huggingFaceModel:
      process.env.HUGGINGFACE_MODERATION_MODEL ?? 'unitary/unbiased-toxic-roberta',
    openAiApiKey: process.env.OPENAI_API_KEY,
  };
}
