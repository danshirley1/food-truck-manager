import { describe, expect, it } from 'vitest';
import {
  normalizeChoiceEffects,
  validateGeneratedScenario,
} from './ai-schemas';
import { makeGeneratedScenarioRaw } from '@/test/fixtures';

describe('ai-schemas', () => {
  describe('normalizeChoiceEffects', () => {
    it('clamps per-stat deltas to the difficulty cap', () => {
      const normalized = normalizeChoiceEffects(
        { money: 50, reputation: -50, energy: 0 },
        'early'
      );

      expect(normalized.money).toBe(10);
      expect(normalized.reputation).toBe(-10);
    });

    it('scales down choices whose total magnitude exceeds the per-choice cap', () => {
      const normalized = normalizeChoiceEffects(
        { money: 20, reputation: 20, energy: 20 },
        'late'
      );

      const magnitude =
        Math.abs(normalized.money ?? 0) +
        Math.abs(normalized.reputation ?? 0) +
        Math.abs(normalized.energy ?? 0);

      // Rounding per stat can land slightly above MAX_IMPACT_PER_CHOICE (36 vs 35).
      expect(magnitude).toBeLessThan(60);
      expect(magnitude).toBeLessThanOrEqual(36);
    });
  });

  describe('validateGeneratedScenario', () => {
    it('accepts a well-formed generated scenario', () => {
      const result = validateGeneratedScenario(makeGeneratedScenarioRaw());

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.menuOptions).toHaveLength(3);
        expect(result.data.choices).toHaveLength(2);
      }
    });

    it('rejects invalid schema payloads', () => {
      const result = validateGeneratedScenario({ title: 'too short' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.length).toBeGreaterThan(0);
      }
    });

    it('rejects menu options without distinct tiers', () => {
      const result = validateGeneratedScenario(
        makeGeneratedScenarioRaw({
          menuOptions: [
            {
              label: 'Option One',
              description: 'First nearly identical option.',
              effects: { money: 1, reputation: 1, energy: -1 },
              verdictReason: 'Barely different from the others.',
              imageSearchTerm: 'food one',
            },
            {
              label: 'Option Two',
              description: 'Second nearly identical option.',
              effects: { money: 1, reputation: 1, energy: -1 },
              verdictReason: 'Also barely different.',
              imageSearchTerm: 'food two',
            },
            {
              label: 'Option Three',
              description: 'Third nearly identical option.',
              effects: { money: 1, reputation: 1, energy: -1 },
              verdictReason: 'Still barely different.',
              imageSearchTerm: 'food three',
            },
          ],
        })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('distinct tiers');
      }
    });

    it('adds a positive boost when raw choices are entirely negative', () => {
      const result = validateGeneratedScenario(
        makeGeneratedScenarioRaw({
          choices: [
            {
              label: 'Terrible choice A',
              effects: { money: -20, reputation: -20, energy: -20 },
              riskLevel: 'risky',
            },
            {
              label: 'Terrible choice B',
              effects: { money: -20, reputation: -20, energy: -20 },
              riskLevel: 'risky',
            },
          ],
        })
      );

      expect(result.success).toBe(true);
      if (result.success) {
        for (const choice of result.data.choices) {
          const hasPositive =
            choice.effects.money > 0 ||
            choice.effects.reputation > 0 ||
            choice.effects.energy > 0;
          const hasNegative =
            choice.effects.money < 0 ||
            choice.effects.reputation < 0 ||
            choice.effects.energy < 0;
          expect(hasPositive && hasNegative).toBe(true);
        }
      }
    });
  });
});
