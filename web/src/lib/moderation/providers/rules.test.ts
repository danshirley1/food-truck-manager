import { describe, expect, it } from 'vitest';
import { moderateWithRules } from './rules';

describe('moderateWithRules', () => {
  it('blocks empty text', () => {
    const result = moderateWithRules('   ');
    expect(result?.allowed).toBe(false);
    if (result && !result.allowed) {
      expect(result.labels).toContain('empty');
    }
  });

  it('returns null for non-empty text so ML providers can run', () => {
    expect(moderateWithRules('galaxy glitter ramen')).toBeNull();
    expect(moderateWithRules('fuck this burrito')).toBeNull();
  });
});
