/**
 * Prompt builders for AI scenario generation.
 */

import { ScenarioContext } from '../types';

export const SYSTEM_PROMPT = `You are a content generator for a family-friendly food truck management game.

RULES:
- Generate only safe-for-work content appropriate for all audiences
- Stay within the food truck business theme
- Output must be valid JSON matching the provided schema exactly
- Resource effects are deltas: money, reputation, energy (integers only)
- Per-field effect limits by difficulty: early ±10, mid ±15, late ±20
- EVERY business choice and EVERY menu option must include at least one negative effect (tradeoff)
- Business choices need riskLevel: safe, moderate, or risky
- dayContext: location (short, specific venue name), crowdDetail (2-3 sentences on who is here and what they want), crowdVibe (one cheeky/funny line summing up the crowd)
- VARIETY: Each day must feel like a new stop on a tour — change location type AND crowd archetype every time. Never repeat a location name, venue type, or crowd profile from the avoid lists in the user prompt.
- Rotate across diverse venues: office parks, stadiums, beaches, university campuses, hospitals, airports, night markets, weddings, construction sites, ski lodges, food festivals, suburban block parties, tourist landmarks, train stations, etc.
- menuOptions: exactly 3 specials forming THREE CLEAR TIERS for today's crowd:
  (A) BEST FIT — crowd loves it: strongest positive money+reputation, modest energy cost
  (B) OKAY FIT — mediocre: middle net outcome, small mixed effects
  (C) BAD FIT — wrong dish: weakest net outcome, include negatives on money or reputation
  Spread effects so (A) scores much better than (B), and (B) better than (C) — never three similar outcomes
- verdictReason on each option must match its tier (A enthusiastic, B lukewarm, C explains the flop)
- menuPrompt: one sentence asking what special goes on the board today

Return ONLY valid JSON.`;

const effectsSchema = {
  type: 'object' as const,
  additionalProperties: false,
  required: ['money', 'reputation', 'energy'] as const,
  properties: {
    money: { type: 'integer' as const },
    reputation: { type: 'integer' as const },
    energy: { type: 'integer' as const },
  },
};

const choiceItemSchema = {
  type: 'object' as const,
  additionalProperties: false,
  required: ['label', 'effects', 'riskLevel'] as const,
  properties: {
    label: { type: 'string' as const },
    effects: effectsSchema,
    riskLevel: {
      type: 'string' as const,
      enum: ['safe', 'moderate', 'risky'] as const,
    },
  },
};

/** Nudge the model toward a different venue archetype each turn */
const VENUE_THEME_HINTS = [
  'weekday office lunch rush',
  'weekend family park or playground',
  'sports stadium or match day fans',
  'beach or waterfront day-trippers',
  'university campus between lectures',
  'hospital or clinic staff break',
  'airport or travel hub grab-and-go',
  'evening night market or street fair',
  'wedding or private celebration',
  'construction or industrial site crew',
  'ski resort or cold-weather visitors',
  'food festival or craft fair browsers',
  'suburban neighbourhood block party',
  'busy tourist landmark queue',
  'commuter train station morning rush',
] as const;

const menuItemSchema = {
  type: 'object' as const,
  additionalProperties: false,
  required: ['label', 'effects', 'verdictReason'] as const,
  properties: {
    label: { type: 'string' as const },
    effects: effectsSchema,
    verdictReason: { type: 'string' as const },
  },
};

export function buildUserPrompt(
  context: ScenarioContext,
  strict = false
): string {
  const { currentResources, turn, difficultyLevel, recentChoices, availableTags } =
    context;

  const strictNote = strict
    ? '\nSTRICT MODE: Smaller effects. Every option still needs a negative effect.'
    : '';

  const recentIds =
    context.recentScenarioIds?.length
      ? `\nAvoid repeating scenario IDs: ${context.recentScenarioIds.join(', ')}`
      : '';

  const recentLocations =
    context.recentLocations?.length
      ? `\nRecent locations to avoid (use a different venue type and name): ${context.recentLocations.join(' | ')}`
      : '';

  const recentCrowds =
    context.recentCrowdVibes?.length
      ? `\nRecent crowd vibes to avoid (invent a fresh crowd): ${context.recentCrowdVibes.join(' | ')}`
      : '';

  const venueHint = context.venueThemeHint
    ? `\nToday's venue theme (build dayContext around this, but make it unique): ${context.venueThemeHint}`
    : '';

  return `Current game state:
- Money: ${currentResources.money}
- Reputation: ${currentResources.reputation}
- Energy: ${currentResources.energy}
- Turn: ${turn}/15
- Required difficulty: ${difficultyLevel}

Recent tags to avoid: ${recentChoices.join(', ') || 'none'}
Allowed tags (1-3): ${availableTags.join(', ')}
${recentIds}${recentLocations}${recentCrowds}${venueHint}
${strictNote}

Generate one ${difficultyLevel} scenario with dayContext, 2-4 business choices, menuPrompt, and exactly 3 menuOptions (one best / one okay / one bad fit for the crowd).`;
}

export function getVenueThemeHint(turn: number): string {
  return VENUE_THEME_HINTS[(turn - 1) % VENUE_THEME_HINTS.length];
}

export const GENERATED_SCENARIO_JSON_SCHEMA = {
  name: 'generated_scenario',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'title',
      'text',
      'tags',
      'difficulty',
      'dayContext',
      'menuPrompt',
      'choices',
      'menuOptions',
    ],
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
      dayContext: {
        type: 'object',
        additionalProperties: false,
        required: ['location', 'crowdDetail', 'crowdVibe'],
        properties: {
          location: { type: 'string' },
          crowdDetail: { type: 'string' },
          crowdVibe: { type: 'string' },
        },
      },
      menuPrompt: { type: 'string' },
      choices: {
        type: 'array',
        minItems: 2,
        maxItems: 4,
        items: choiceItemSchema,
      },
      menuOptions: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: menuItemSchema,
      },
    },
  },
} as const;
