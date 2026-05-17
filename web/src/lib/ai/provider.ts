/**
 * LLM provider for scenario generation (OpenAI structured output).
 */

import { ScenarioContext } from '../types';
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  GENERATED_SCENARIO_JSON_SCHEMA,
} from './prompts';

export interface GenerateScenarioResult {
  raw: unknown;
  model: string;
}

export function assertOpenAiConfigured(): void {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error(
      'OPENAI_API_KEY is not configured. Add it to web/.env (see web/.env.example).'
    );
  }
}

export async function generateScenarioFromLlm(
  context: ScenarioContext,
  options: { strict?: boolean } = {}
): Promise<GenerateScenarioResult> {
  assertOpenAiConfigured();

  const apiKey = process.env.OPENAI_API_KEY!;
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: options.strict ? 0.5 : 0.8,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(context, options.strict) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: GENERATED_SCENARIO_JSON_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    try {
      const parsed = JSON.parse(body) as {
        error?: { code?: string; message?: string };
      };
      if (parsed.error?.code === 'insufficient_quota') {
        throw new Error(
          'OpenAI quota exceeded. Add billing or credits at https://platform.openai.com/account/billing'
        );
      }
      if (parsed.error?.message) {
        throw new Error(parsed.error.message);
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('quota')) {
        throw e;
      }
    }
    throw new Error(`OpenAI API error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage?: { total_tokens?: number };
  };

  if (data.usage?.total_tokens) {
    console.log(`[ai] tokens used: ${data.usage.total_tokens}`);
  }

  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  const raw = JSON.parse(content) as unknown;
  return { raw, model };
}
