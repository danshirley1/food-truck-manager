/**
 * Validates and normalizes AI-generated scenarios before returning to clients.
 */

import { Scenario, ScenarioContext } from '../types';
import {
  validateGeneratedScenario,
  mapGeneratedToScenario,
} from '../types/ai-schemas';

export type ValidationResult =
  | { ok: true; scenario: Scenario }
  | { ok: false; error: string };

export function processGeneratedScenario(
  raw: unknown,
  context: ScenarioContext
): ValidationResult {
  const validated = validateGeneratedScenario(raw);
  if (!validated.success) {
    return { ok: false, error: validated.error };
  }

  if (validated.data.difficulty !== context.difficultyLevel) {
    return {
      ok: false,
      error: `Difficulty mismatch: expected ${context.difficultyLevel}`,
    };
  }

  try {
    const scenario = mapGeneratedToScenario(validated.data, context.turn);
    return { ok: true, scenario };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Mapping failed';
    return { ok: false, error: message };
  }
}
