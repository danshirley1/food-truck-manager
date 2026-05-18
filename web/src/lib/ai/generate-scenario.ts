/**
 * Orchestrates AI scenario generation with validation and moderation.
 */

import { Scenario, ScenarioContext } from '../types';
import { assertOpenAiConfigured, generateScenarioFromLlm } from './provider';
import { processGeneratedScenario } from './validate-scenario';
import { moderateScenarioContent } from './moderation';

const MAX_GENERATION_ATTEMPTS = 4;

export async function generateScenario(context: ScenarioContext): Promise<Scenario> {
  assertOpenAiConfigured();

  let lastError = 'Unknown error';
  let lastValidationError: string | undefined;

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const strict = attempt >= 2;

    try {
      const { raw } = await generateScenarioFromLlm(context, {
        strict,
        validationError: lastValidationError,
      });
      const processed = processGeneratedScenario(raw, context);

      if (!processed.ok) {
        lastError = processed.error;
        lastValidationError = processed.error;
        console.warn(
          `[generateScenario] validation failed (attempt ${attempt + 1}/${MAX_GENERATION_ATTEMPTS}):`,
          processed.error
        );
        continue;
      }

      const moderated = await moderateScenarioContent({
        title: processed.scenario.title,
        text: processed.scenario.text,
        choices: processed.scenario.choices,
        menuPrompt: processed.scenario.menuPrompt,
        menuOptions: processed.scenario.menuOptions,
        dayContext: processed.scenario.dayContext,
      });

      if (!moderated) {
        lastError = 'Content moderation failed';
        lastValidationError = lastError;
        continue;
      }

      return processed.scenario;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(
        `[generateScenario] attempt ${attempt + 1}/${MAX_GENERATION_ATTEMPTS} failed:`,
        lastError
      );
    }
  }

  throw new Error(`Failed to generate scenario: ${lastError}`);
}
