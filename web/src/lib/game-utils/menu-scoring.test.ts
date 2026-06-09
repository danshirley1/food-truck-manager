import { describe, expect, it } from 'vitest';
import {
  computeMenuFitScore,
  menuFeedbackMessage,
  menuOptionsHaveDistinctTiers,
  rankMenuStars,
} from './menu-scoring';
import { makeMenuOptions } from '@/test/fixtures';

describe('menu-scoring', () => {
  describe('computeMenuFitScore', () => {
    it('weights reputation highest and energy as a cost', () => {
      const score = computeMenuFitScore({
        money: 10,
        reputation: 8,
        energy: -4,
      });

      expect(score).toBeCloseTo(8, 5);
    });
  });

  describe('rankMenuStars', () => {
    it('ranks best, middle, and worst picks as 3, 2, and 1 stars', () => {
      const options = makeMenuOptions();

      expect(rankMenuStars(options, 'menu-best')).toBe(3);
      expect(rankMenuStars(options, 'menu-mid')).toBe(2);
      expect(rankMenuStars(options, 'menu-worst')).toBe(1);
    });
  });

  describe('menuOptionsHaveDistinctTiers', () => {
    it('accepts clearly separated early-game tiers', () => {
      expect(
        menuOptionsHaveDistinctTiers(makeMenuOptions(), 'early')
      ).toBe(true);
    });

    it('rejects options that are too close together', () => {
      const flat = makeMenuOptions().map((option) => ({
        effects: { money: 1, reputation: 1, energy: -1 },
      }));

      expect(menuOptionsHaveDistinctTiers(flat, 'early')).toBe(false);
    });
  });

  describe('menuFeedbackMessage', () => {
    it('returns a message for each star rating', () => {
      expect(menuFeedbackMessage(3)).toContain('Perfect');
      expect(menuFeedbackMessage(2)).toContain('decent');
      expect(menuFeedbackMessage(1)).toContain('missed');
    });
  });
});
