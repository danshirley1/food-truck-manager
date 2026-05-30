/**
 * Orchestrates AI scenario generation with validation and moderation.
 */

import { Scenario, ScenarioContext } from '../types';
import { assertOpenAiConfigured, generateScenarioFromLlm } from './provider';
import { processGeneratedScenario } from './validate-scenario';
import { moderateScenarioContent } from './moderation';
import { attachMenuImageUrls } from './resolve-menu-image-url';
import type { LlmDevDebug } from '../types/llm-dev-debug';
import { isDevLlmDebugEnabled } from '../types/llm-dev-debug';

const MAX_GENERATION_ATTEMPTS = 4;

export interface GenerateScenarioOutput {
  scenario: Scenario;
  dev?: LlmDevDebug;
}

export async function generateScenario(
  context: ScenarioContext
): Promise<GenerateScenarioOutput> {
  assertOpenAiConfigured();

  let lastError = 'Unknown error';
  let lastValidationError: string | undefined;

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const strict = attempt >= 2;

    try {
      const llmResult = await generateScenarioFromLlm(context, {
        strict,
        validationError: lastValidationError,
      });
      const processed = processGeneratedScenario(llmResult.raw, context);

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

      const { scenario, menuImageDebug } = await attachMenuImageUrls(processed.scenario);

      const dev: LlmDevDebug | undefined = isDevLlmDebugEnabled()
        ? {
            capturedAt: new Date().toISOString(),
            scenarioGeneration: {
              model: llmResult.model,
              attempt: attempt + 1,
              rawParsed: llmResult.raw,
              chatCompletionResponse: llmResult.chatCompletionResponse,
            },
            menuImageSearch: menuImageDebug,
          }
        : undefined;

      return { scenario, dev };
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
