import type { ModerationResult } from '../types';

export function moderateWithRules(text: string): ModerationResult | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      allowed: false,
      provider: 'rules',
      reason: 'Description cannot be empty',
      labels: ['empty'],
    };
  }

  return null;
}
