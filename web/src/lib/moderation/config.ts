import type { ModerationConfig } from './types';

export function getModerationConfig(): ModerationConfig {
  const providerRaw = (process.env.TEXT_MODERATION_PROVIDER ?? 'huggingface').toLowerCase();

  let provider: ModerationConfig['provider'] = 'huggingface';
  if (providerRaw === 'openai') provider = 'openai';
  else if (providerRaw === 'rules-only') provider = 'rules-only';
  else if (providerRaw === 'local-model' || providerRaw === 'local') provider = 'local-model';

  return {
    enabled: process.env.TEXT_MODERATION_ENABLED !== 'false',
    provider,
    threshold: parseFloat(process.env.TEXT_MODERATION_THRESHOLD ?? '0.5'),
    huggingFaceApiKey: process.env.HUGGINGFACE_API_KEY,
    huggingFaceModel:
      process.env.HUGGINGFACE_MODERATION_MODEL ?? 'dshirls/food-truck-moderation-v1',
    huggingFaceInferenceEndpoint: process.env.HUGGINGFACE_INFERENCE_ENDPOINT,
    profanityCheckEnabled: process.env.TEXT_MODERATION_PROFANITY_CHECK !== 'false',
    profanityModel:
      process.env.TEXT_MODERATION_PROFANITY_MODEL ?? 'unitary/unbiased-toxic-roberta',
    profanityThreshold: parseFloat(process.env.TEXT_MODERATION_PROFANITY_THRESHOLD ?? '0.45'),
    profanityLabels: (process.env.TEXT_MODERATION_PROFANITY_LABELS ?? 'obscene')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    profanityInsultHardThreshold: parseFloat(
      process.env.TEXT_MODERATION_PROFANITY_INSULT_HARD ?? '0.99'
    ),
    profanityInsultSoftMin: parseFloat(
      process.env.TEXT_MODERATION_PROFANITY_INSULT_SOFT_MIN ?? '0.92'
    ),
    profanityInsultSoftMax: parseFloat(
      process.env.TEXT_MODERATION_PROFANITY_INSULT_SOFT_MAX ?? '0.99'
    ),
    profanityThreatThreshold: parseFloat(
      process.env.TEXT_MODERATION_PROFANITY_THREAT ?? '0.45'
    ),
    profanityIdentityThreshold: parseFloat(
      process.env.TEXT_MODERATION_PROFANITY_IDENTITY ?? '0.5'
    ),
    openAiApiKey: process.env.OPENAI_API_KEY,
    localModelPath: process.env.LOCAL_MODERATION_MODEL_PATH,
  };
}
