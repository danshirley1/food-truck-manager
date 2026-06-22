import { getModerationConfig } from './config';
import { moderateWithHuggingFace } from './providers/huggingface';
import { moderateWithLocalModel } from './providers/local-model';
import { moderateWithOpenAi } from './providers/openai';
import { moderateWithRules } from './providers/rules';
import type { ModerationResult } from './types';

export async function moderateText(text: string): Promise<ModerationResult> {
  const config = getModerationConfig();

  if (!config.enabled) {
    return { allowed: true, provider: 'rules' };
  }

  const rulesResult = moderateWithRules(text);
  if (rulesResult && !rulesResult.allowed) {
    return rulesResult;
  }

  if (config.provider === 'rules-only') {
    return { allowed: true, provider: 'rules' };
  }

  const primary =
    config.provider === 'openai'
      ? await moderateWithOpenAi(text, config)
      : config.provider === 'local-model'
        ? await moderateWithLocalModel(text, config)
        : await moderateWithHuggingFace(text, config);

  if (primary) {
    return primary;
  }

  const fallback =
    config.provider === 'openai'
      ? await moderateWithHuggingFace(text, config)
      : config.provider === 'local-model'
        ? await moderateWithHuggingFace(text, config)
        : config.provider === 'huggingface'
          ? (await moderateWithLocalModel(text, config)) ??
            (await moderateWithOpenAi(text, config))
          : await moderateWithOpenAi(text, config);

  if (fallback) {
    return fallback;
  }

  console.warn(
    '[moderation] No provider available — failing open (check API keys and TEXT_MODERATION_PROVIDER)'
  );
  return { allowed: true, provider: 'rules' };
}
