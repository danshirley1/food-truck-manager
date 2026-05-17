/**
 * Orchestrates AI scenario generation with validation and moderation.
 */

import { Scenario, ScenarioContext } from '../types';
import { assertOpenAiConfigured, generateScenarioFromLlm } from './provider';
import { processGeneratedScenario } from './validate-scenario';
import { moderateScenarioContent } from './moderation';

export async function generateScenario(context: ScenarioContext): Promise<Scenario> {
  assertOpenAiConfigured();

  let lastError = 'Unknown error';

  for (const strict of [false, true]) {
    try {
      const { raw } = await generateScenarioFromLlm(context, { strict });
      const processed = processGeneratedScenario(raw, context);

      if (!processed.ok) {
        lastError = processed.error;
        continue;
      }

      const moderated = await moderateScenarioContent({
        title: processed.scenario.title,
        text: processed.scenario.text,
        choices: processed.scenario.choices,
      });

      if (!moderated) {
        lastError = 'Content moderation failed';
        continue;
      }

      return processed.scenario;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error('[generateScenario] attempt failed:', lastError);
    }
  }

  throw new Error(`Failed to generate scenario: ${lastError}`);
}
