/**
 * Scenario loader — AI generation via POST /api/scenarios/generate.
 */

import { Scenario, ScenarioContext } from '../types';

interface GenerateApiResponse {
  success: boolean;
  scenario?: Scenario;
  error?: string;
}

export class ApiScenarioLoader {
  static async getScenario(context: ScenarioContext): Promise<Scenario> {
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
      ...data.scenario,
      createdAt: data.scenario.createdAt
        ? new Date(data.scenario.createdAt)
        : new Date(),
    };
  }
}
