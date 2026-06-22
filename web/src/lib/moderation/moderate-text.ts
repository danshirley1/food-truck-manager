import { getModerationConfig } from './config';
import {
  isSoftInsultFalsePositive,
  moderatePretrainedSafetyWithHuggingFace,
  moderateWithHuggingFace,
} from './providers/huggingface';
import { moderateWithLocalModel } from './providers/local-model';
import { moderateWithOpenAi } from './providers/openai';
import { moderateWithRules } from './providers/rules';
import type { ModerationConfig, ModerationResult } from './types';

function combineGameAndPretrained(
  gameResult: ModerationResult,
  pretrained: ModerationResult | null,
  config: ModerationConfig
): ModerationResult {
  if (pretrained && !pretrained.allowed) {
    return pretrained;
  }

  if (!gameResult.allowed) {
    if (
      pretrained?.scores &&
      isSoftInsultFalsePositive(pretrained.scores, {
        obscene: config.profanityThreshold,
        insultHard: config.profanityInsultHardThreshold,
        insultSoftMin: config.profanityInsultSoftMin,
        insultSoftMax: config.profanityInsultSoftMax,
        threat: config.profanityThreatThreshold,
        identityAttack: config.profanityIdentityThreshold,
      })
    ) {
      return { allowed: true, provider: gameResult.provider, scores: pretrained.scores };
    }
    return gameResult;
  }

  return gameResult;
}

async function applyPretrainedSafetyPass(
  text: string,
  config: ModerationConfig,
  gameResult: ModerationResult
): Promise<ModerationResult> {
  if (!config.profanityCheckEnabled) {
    return gameResult;
  }

  const pretrained = await moderatePretrainedSafetyWithHuggingFace(text, config);
  return combineGameAndPretrained(gameResult, pretrained, config);
}

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
    return applyPretrainedSafetyPass(text, config, primary);
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
    return applyPretrainedSafetyPass(text, config, fallback);
  }

  console.warn(
    '[moderation] No provider available — failing open (check API keys and TEXT_MODERATION_PROVIDER)'
  );
  return { allowed: true, provider: 'rules' };
}
