/**
 * Scenario loader — AI generation via POST /api/scenarios/generate.
 */

import { Scenario, ScenarioContext } from '../types';
import type { LlmDevDebug } from '../types/llm-dev-debug';

interface GenerateApiResponse {
  success: boolean;
  scenario?: Scenario;
  dev?: LlmDevDebug;
  error?: string;
}

export interface ScenarioLoadResult {
  scenario: Scenario;
  dev?: LlmDevDebug;
}

export class ApiScenarioLoader {
  static async getScenario(context: ScenarioContext): Promise<ScenarioLoadResult> {
    const response = await fetch('/api/scenarios/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    });

    const data: GenerateApiResponse = await response.json().catch(() => ({
      success: false,
      error: 'Invalid response from server',
    }));

    if (!response.ok || !data.success || !data.scenario) {
      throw new Error(data.error ?? `Generate API returned ${response.status}`);
    }

    return {
      scenario: {
        ...data.scenario,
        createdAt: data.scenario.createdAt
          ? new Date(data.scenario.createdAt)
          : new Date(),
      },
      dev: data.dev,
    };
  }
}
