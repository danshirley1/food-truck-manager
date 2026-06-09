import type { ModerationConfig, ModerationResult } from '../types';

type OpenAiModerationResponse = {
  results: Array<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }>;
};

export async function moderateWithOpenAi(
  text: string,
  config: ModerationConfig
): Promise<ModerationResult | null> {
  if (!config.openAiApiKey) {
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text }),
    });

    if (!response.ok) {
      console.warn('[moderation:openai] API error:', response.status);
      return null;
    }

    const data = (await response.json()) as OpenAiModerationResponse;
    const result = data.results?.[0];
    if (!result) {
      return { allowed: true, provider: 'openai' };
    }

    const labels = Object.entries(result.categories)
      .filter(([, flagged]) => flagged)
      .map(([label]) => label);

    if (result.flagged) {
      return {
        allowed: false,
        provider: 'openai',
        reason: 'OpenAI moderation flagged content',
        labels,
        scores: result.category_scores,
      };
    }

    return {
      allowed: true,
      provider: 'openai',
      scores: result.category_scores,
    };
  } catch (err) {
    console.warn('[moderation:openai] Request failed:', err);
    return null;
  }
}
