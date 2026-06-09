import { describe, expect, it } from 'vitest';
import { processGeneratedScenario } from './validate-scenario';
import { makeGeneratedScenarioRaw } from '@/test/fixtures';

describe('processGeneratedScenario', () => {
  it('maps a valid generated payload into a playable scenario', () => {
    const result = processGeneratedScenario(makeGeneratedScenarioRaw(), {
      currentResources: { money: 100, reputation: 50, energy: 80 },
      turn: 1,
      difficultyLevel: 'early',
      recentChoices: [],
      availableTags: ['weather'],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.scenario.id).toMatch(/^ai-1-/);
      expect(result.scenario.choices).toHaveLength(2);
      expect(result.scenario.menuOptions).toHaveLength(3);
      expect(result.scenario.createdBy).toBe('ai');
    }
  });

  it('rejects difficulty mismatches against the request context', () => {
    const result = processGeneratedScenario(makeGeneratedScenarioRaw(), {
      currentResources: { money: 100, reputation: 50, energy: 80 },
      turn: 5,
      difficultyLevel: 'late',
      recentChoices: [],
      availableTags: ['weather'],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Difficulty mismatch');
    }
  });
});
