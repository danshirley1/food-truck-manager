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

  if (isBlockedLabel(top.label)) {
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

export async function moderateWithHuggingFace(
  text: string,
  config: ModerationConfig
): Promise<ModerationResult | null> {
  if (!config.huggingFaceApiKey) {
    return null;
  }

  const model = encodeURIComponent(config.huggingFaceModel);
  const url = `https://api-inference.huggingface.co/models/${model}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.huggingFaceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.warn('[moderation:huggingface] API error:', response.status, body);
      return null;
    }

    const data = (await response.json()) as
      | HfClassificationItem[]
      | HfClassificationItem[][];

    const items = Array.isArray(data[0])
      ? (data as HfClassificationItem[][])[0]
      : (data as HfClassificationItem[]);

    return evaluateClassification(items, config.threshold);
  } catch (err) {
    console.warn('[moderation:huggingface] Request failed:', err);
    return null;
  }
}
