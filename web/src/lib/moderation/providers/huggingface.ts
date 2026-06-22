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

/** Pre-trained multi-label models: block only obscene/insult (not overall toxic — gross food stays allowed). */
export function evaluateProfanityLabels(
  items: HfClassificationItem[],
  threshold: number,
  labelNames: string[] = ['obscene', 'insult']
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

export async function moderateProfanityWithHuggingFace(
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

  return evaluateProfanityLabels(items, config.profanityThreshold);
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
