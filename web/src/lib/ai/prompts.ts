/**
 * Prompt builders for AI scenario generation.
 */

import { ScenarioContext } from '../types';

export const SYSTEM_PROMPT = `You are a content generator for a family-friendly food truck management game.

RULES:
- Generate only safe-for-work content appropriate for all audiences
- Stay within the food truck business theme (customers, supplies, permits, equipment, competition, weather, events)
- Output must be valid JSON matching the provided schema exactly
- Resource effects are deltas: money, reputation, energy (integers only)
- Per-field effect limits by difficulty: early ±10, mid ±15, late ±20
- Each choice must be meaningfully different in strategy and outcomes
- EVERY choice must include at least one negative effect (money < 0, reputation < 0, or energy < 0). No purely beneficial choices — there is always a tradeoff
- Include at least one choice that is not devastating on all resources
- Do not repeat scenario types listed in recentChoices
- Match the requested difficulty level exactly

Return ONLY valid JSON with keys: title, text, tags, difficulty, choices.
Each choice has: label, effects (money, reputation, energy as integers — use 0 when a resource is unchanged), riskLevel (safe|moderate|risky).`;

export function buildUserPrompt(
  context: ScenarioContext,
  strict = false
): string {
  const { currentResources, turn, difficultyLevel, recentChoices, availableTags } =
    context;

  const strictNote = strict
    ? '\nSTRICT MODE: Effects must be smaller. Every choice still needs at least one negative effect.'
    : '';

  const recentIds =
    context.recentScenarioIds?.length
      ? `\nAvoid repeating these scenario themes/ids: ${context.recentScenarioIds.join(', ')}`
      : '';

  const tone =
    context.tone === 'light'
      ? 'Keep the tone light and encouraging.'
      : 'Keep the tone realistic but professional.';

  return `Current game state:
- Money: ${currentResources.money}
- Reputation: ${currentResources.reputation}
- Energy: ${currentResources.energy}
- Turn: ${turn}/15
- Required difficulty: ${difficultyLevel}

Recent scenario tags to avoid: ${recentChoices.join(', ') || 'none'}
Allowed tags (pick 1-3): ${availableTags.join(', ')}
${recentIds}

${tone}
${strictNote}

Generate one ${difficultyLevel} difficulty scenario with 2-4 choices.
Effects should reflect current resources (e.g. if energy is low, a rest option may boost energy but must cost money or reputation).
Every choice must have at least one of money, reputation, or energy as a negative number.
Set difficulty field to "${difficultyLevel}".`;
}

export const GENERATED_SCENARIO_JSON_SCHEMA = {
  name: 'generated_scenario',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'text', 'tags', 'difficulty', 'choices'],
    properties: {
      title: { type: 'string' },
      text: { type: 'string' },
      tags: {
        type: 'array',
        items: {
          type: 'string',
          enum: [
            'customer-service',
            'supply-management',
            'equipment',
            'permits',
            'competition',
            'weather',
            'community-event',
            'crisis',
            'expansion',
          ],
        },
      },
      difficulty: { type: 'string', enum: ['early', 'mid', 'late'] },
      choices: {
        type: 'array',
        minItems: 2,
        maxItems: 4,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['label', 'effects', 'riskLevel'],
          properties: {
            label: { type: 'string' },
            effects: {
              type: 'object',
              additionalProperties: false,
              required: ['money', 'reputation', 'energy'],
              properties: {
                money: { type: 'integer' },
                reputation: { type: 'integer' },
                energy: { type: 'integer' },
              },
            },
            riskLevel: {
              type: 'string',
              enum: ['safe', 'moderate', 'risky'],
            },
          },
        },
      },
    },
  },
} as const;
