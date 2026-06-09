import { describe, expect, it } from 'vitest';
import {
  clamp,
  formatMoney,
  formatResourceChange,
  SeededRandom,
} from './helpers';

describe('helpers', () => {
  describe('clamp', () => {
    it('keeps values inside the allowed range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('formatMoney', () => {
    it('formats positive and negative amounts', () => {
      expect(formatMoney(12)).toBe('+$12');
      expect(formatMoney(-7)).toBe('-$7');
    });
  });

  describe('formatResourceChange', () => {
    it('formats non-zero changes and hides zero', () => {
      expect(formatResourceChange(4)).toBe('+4');
      expect(formatResourceChange(-3)).toBe('-3');
      expect(formatResourceChange(0)).toBe('');
    });
  });

  describe('SeededRandom', () => {
    it('returns deterministic values for the same seed', () => {
      const first = new SeededRandom('food-truck-seed');
      const second = new SeededRandom('food-truck-seed');

      expect(first.next()).toBe(second.next());
      expect(first.choice(['a', 'b', 'c'])).toBe(second.choice(['a', 'b', 'c']));
    });
  });
});
