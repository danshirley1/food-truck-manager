import type { ModerationResult } from '../types';

/** Obvious blocklist for fast local rejection before ML inference. */
const BLOCKED_PATTERNS: RegExp[] = [
  /\b(fuck|shit|bitch|asshole|cunt|nigger|nigga|faggot|retard)\b/i,
  /\b(kill\s+(yourself|urself)|kys)\b/i,
];

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

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        provider: 'rules',
        reason: 'Blocked by local safety rules',
        labels: ['blocklist'],
      };
    }
  }

  return null;
}
