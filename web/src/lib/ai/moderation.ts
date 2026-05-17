/**
 * OpenAI Moderation API — lightweight content safety check.
 */

export async function moderateTexts(texts: string[]): Promise<boolean> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return true;
  }

  const input = texts.filter(Boolean).join('\n').slice(0, 8000);
  if (!input.trim()) {
    return true;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      console.warn('[moderation] API error:', response.status);
      return true;
    }

    const data = (await response.json()) as {
      results: Array<{ flagged: boolean }>;
    };
    return !data.results?.some((r) => r.flagged);
  } catch (err) {
    console.warn('[moderation] Request failed:', err);
    return true;
  }
}

export async function moderateScenarioContent(scenario: {
  title: string;
  text: string;
  choices: Array<{ label: string }>;
}): Promise<boolean> {
  const texts = [
    scenario.title,
    scenario.text,
    ...scenario.choices.map((c) => c.label),
  ];
  return moderateTexts(texts);
}
