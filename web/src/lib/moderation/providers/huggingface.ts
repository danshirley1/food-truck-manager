import type { ModerationConfig, ModerationResult } from '../types';

type HfClassificationItem = {
  label: string;
  score: number;
};

function parseScores(items: HfClassificationItem[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const item of items) {
    scores[item.label.toLowerCase()] = item.score;
  }
  return scores;
}

function isAllowedLabel(label: string): boolean {
  const normalized = label.toLowerCase();
  return (
    normalized.includes('non-toxic') ||
    normalized.includes('neutral') ||
    normalized.includes('safe') ||
    normalized === 'label_0' ||
    normalized === 'allowed'
  );
}

function isBlockedLabel(label: string): boolean {
  if (isAllowedLabel(label)) {
    return false;
  }

  const normalized = label.toLowerCase();
  return (
    normalized.includes('toxic') ||
    normalized.includes('hate') ||
    normalized.includes('offensive') ||
    normalized.includes('insult') ||
    normalized.includes('threat') ||
    normalized.includes('sexual') ||
    normalized.includes('obscene') ||
    normalized === 'label_1' ||
    normalized === 'blocked' ||
    normalized === 'unsafe'
  );
}

function hasBinaryAllowedBlockedLabels(items: HfClassificationItem[]): boolean {
  const labels = new Set(items.map((item) => item.label.toLowerCase()));
  return labels.has('allowed') && labels.has('blocked');
}

export function evaluateClassification(
  items: HfClassificationItem[],
  threshold: number
): ModerationResult {
  const scores = parseScores(items);
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const top = sorted[0];

  if (!top) {
    return { allowed: true, provider: 'huggingface', scores };
  }

  // Custom game model: explicit allowed / blocked labels — block only when blocked >= threshold
  if (hasBinaryAllowedBlockedLabels(items)) {
    const blockedScore = scores.blocked ?? 0;

    if (blockedScore >= threshold) {
      return {
        allowed: false,
        provider: 'huggingface',
        reason: `Model flagged content (blocked)`,
        labels: ['blocked'],
        scores,
      };
    }

    return {
      allowed: true,
      provider: 'huggingface',
      scores,
    };
  }

  const blockedCandidates = sorted.filter((item) => isBlockedLabel(item.label));
  const topBlocked = blockedCandidates[0];

  if (topBlocked && topBlocked.score >= threshold) {
    return {
      allowed: false,
      provider: 'huggingface',
      reason: `Model flagged content (${topBlocked.label})`,
      labels: blockedCandidates
        .filter((item) => item.score >= threshold)
        .map((item) => item.label),
      scores,
    };
  }

  if (isAllowedLabel(top.label) && top.score >= threshold) {
    return { allowed: true, provider: 'huggingface', scores };
  }

  // Pre-trained multi-label models: only block toxic labels above threshold (not merely top label)
  if (isBlockedLabel(top.label) && top.score >= threshold) {
    return {
      allowed: false,
      provider: 'huggingface',
      reason: `Model flagged content (${top.label})`,
      labels: [top.label],
      scores,
    };
  }

  return { allowed: true, provider: 'huggingface', scores };
}

/** RoBERTa safety labels — tuned to avoid gross-food false positives (see TEXT_MODERATION.md). */
export type PretrainedSafetyThresholds = {
  obscene: number;
  insultHard: number;
  insultSoftMin: number;
  insultSoftMax: number;
  threat: number;
  identityAttack: number;
};

export const DEFAULT_PRETRAINED_THRESHOLDS: PretrainedSafetyThresholds = {
  obscene: 0.45,
  insultHard: 0.99,
  insultSoftMin: 0.92,
  insultSoftMax: 0.99,
  threat: 0.45,
  identityAttack: 0.5,
};

export function isSoftInsultFalsePositive(
  scores: Record<string, number>,
  thresholds: PretrainedSafetyThresholds = DEFAULT_PRETRAINED_THRESHOLDS
): boolean {
  const obscene = scores.obscene ?? 0;
  const insult = scores.insult ?? 0;
  return (
    obscene < 0.05 &&
    insult >= thresholds.insultSoftMin &&
    insult < thresholds.insultSoftMax
  );
}

/** Pre-trained multi-label model (unbiased-toxic-roberta). */
export function evaluatePretrainedSafety(
  items: HfClassificationItem[],
  thresholds: PretrainedSafetyThresholds = DEFAULT_PRETRAINED_THRESHOLDS
): ModerationResult {
  const scores = parseScores(items);
  const hits: string[] = [];

  if ((scores.obscene ?? 0) >= thresholds.obscene) hits.push('obscene');
  if ((scores.insult ?? 0) >= thresholds.insultHard) hits.push('insult');
  if ((scores.threat ?? 0) >= thresholds.threat) hits.push('threat');
  if ((scores.identity_attack ?? 0) >= thresholds.identityAttack) hits.push('identity_attack');

  if (hits.length > 0) {
    return {
      allowed: false,
      provider: 'profanity-model',
      reason: `Pre-trained safety model flagged content (${hits.join(', ')})`,
      labels: hits,
      scores,
    };
  }

  return { allowed: true, provider: 'profanity-model', scores };
}

/** @deprecated Use evaluatePretrainedSafety */
export function evaluateProfanityLabels(
  items: HfClassificationItem[],
  threshold: number,
  labelNames: string[] = ['obscene']
): ModerationResult {
  const scores = parseScores(items);
  const hits = labelNames.filter((name) => (scores[name.toLowerCase()] ?? 0) >= threshold);

  if (hits.length > 0) {
    return {
      allowed: false,
      provider: 'profanity-model',
      reason: `Profanity model flagged content (${hits.join(', ')})`,
      labels: hits,
      scores,
    };
  }

  return { allowed: true, provider: 'profanity-model', scores };
}

/** HF Inference Providers base URL (legacy api-inference.huggingface.co was decommissioned). */
const HF_INFERENCE_BASE =
  process.env.HUGGINGFACE_INFERENCE_BASE_URL ??
  'https://router.huggingface.co/hf-inference';

async function fetchHfClassification(
  text: string,
  apiKey: string,
  url: string
): Promise<HfClassificationItem[] | null> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      if (body.includes('not supported by provider hf-inference')) {
        console.warn(
          '[moderation:huggingface] Model not on hf-inference catalog. ' +
            'Use a dedicated Inference Endpoint or TEXT_MODERATION_PROVIDER=local-model.'
        );
      } else {
        console.warn('[moderation:huggingface] API error:', response.status, body.slice(0, 200));
      }
      return null;
    }

    const data = (await response.json()) as
      | HfClassificationItem[]
      | HfClassificationItem[][];

    return Array.isArray(data[0])
      ? (data as HfClassificationItem[][])[0]
      : (data as HfClassificationItem[]);
  } catch (err) {
    console.warn('[moderation:huggingface] Request failed:', err);
    return null;
  }
}

export async function moderatePretrainedSafetyWithHuggingFace(
  text: string,
  config: ModerationConfig
): Promise<ModerationResult | null> {
  if (!config.huggingFaceApiKey || !config.profanityCheckEnabled) {
    return null;
  }

  const url = `${HF_INFERENCE_BASE}/models/${encodeURIComponent(config.profanityModel)}`;
  const items = await fetchHfClassification(text, config.huggingFaceApiKey, url);
  if (!items) {
    return null;
  }

  const thresholds: PretrainedSafetyThresholds = {
    obscene: config.profanityThreshold,
    insultHard: config.profanityInsultHardThreshold,
    insultSoftMin: config.profanityInsultSoftMin,
    insultSoftMax: config.profanityInsultSoftMax,
    threat: config.profanityThreatThreshold,
    identityAttack: config.profanityIdentityThreshold,
  };

  return evaluatePretrainedSafety(items, thresholds);
}

/** @deprecated alias */
export async function moderateProfanityWithHuggingFace(
  text: string,
  config: ModerationConfig
): Promise<ModerationResult | null> {
  return moderatePretrainedSafetyWithHuggingFace(text, config);
}

export async function moderateWithHuggingFace(
  text: string,
  config: ModerationConfig
): Promise<ModerationResult | null> {
  if (!config.huggingFaceApiKey) {
    return null;
  }

  const url = config.huggingFaceInferenceEndpoint
    ? config.huggingFaceInferenceEndpoint.replace(/\/$/, '')
    : `${HF_INFERENCE_BASE}/models/${encodeURIComponent(config.huggingFaceModel)}`;

  const items = await fetchHfClassification(text, config.huggingFaceApiKey, url);
  if (!items) {
    return null;
  }

  return evaluateClassification(items, config.threshold);
}
