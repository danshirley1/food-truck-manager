import { describe, expect, it } from 'vitest';
import { evaluateClassification } from './huggingface';

describe('evaluateClassification', () => {
  it('blocks when toxic label exceeds threshold', () => {
    const result = evaluateClassification(
      [
        { label: 'toxic', score: 0.92 },
        { label: 'non-toxic', score: 0.08 },
      ],
      0.5
    );

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.labels).toContain('toxic');
    }
  });

  it('allows when non-toxic is dominant', () => {
    const result = evaluateClassification(
      [
        { label: 'non-toxic', score: 0.95 },
        { label: 'toxic', score: 0.05 },
      ],
      0.5
    );

    expect(result.allowed).toBe(true);
  });

  it('includes scores in the result', () => {
    const result = evaluateClassification(
      [
        { label: 'toxic', score: 0.7 },
        { label: 'non-toxic', score: 0.3 },
      ],
      0.5
    );

    expect(result.scores?.toxic).toBe(0.7);
  });
});
