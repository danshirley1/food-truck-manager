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

  it('blocks obvious profanity', () => {
    const result = moderateWithRules('fuck this burrito');
    expect(result?.allowed).toBe(false);
    expect(result?.provider).toBe('rules');
  });

  it('returns null for clean creative food text', () => {
    expect(moderateWithRules('galaxy glitter ramen')).toBeNull();
  });
});
