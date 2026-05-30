/**
 * Zod schemas for LLM-generated scenario content.
 */

import { z } from 'zod';
import {
  RiskLevelSchema,
  DifficultyLevelSchema,
  ScenarioTagSchema,
  ScenarioSchema,
} from './validation';
import { Scenario, ResourceEffects } from './core';
import { generateId } from '../game-utils/helpers';
import {
  DIFFICULTY_MAX_EFFECT,
  MAX_IMPACT_PER_CHOICE,
} from '../game-utils/effect-limits';
import { menuOptionsHaveDistinctTiers } from '../game-utils/menu-scoring';
import type { DifficultyLevel } from './core';

const GeneratedEffectsSchema = z.object({
  money: z.number().min(-20).max(20),
  reputation: z.number().min(-20).max(20),
  energy: z.number().min(-20).max(20),
});

export const GeneratedDayContextSchema = z.object({
  location: z.string().min(5).max(120),
  crowdDetail: z.string().min(30).max(400),
  crowdVibe: z.string().min(10).max(120),
});

export const GeneratedChoiceSchema = z.object({
  label: z.string().min(5).max(120),
  effects: GeneratedEffectsSchema,
  riskLevel: RiskLevelSchema,
});

export const GeneratedMenuOptionSchema = z.object({
  label: z.string().min(5).max(120),
  description: z.string().min(10).max(160),
  effects: GeneratedEffectsSchema,
  verdictReason: z.string().min(15).max(200),
  imageSearchTerm: z.string().min(3).max(80),
});

export const GeneratedScenarioSchema = z.object({
  title: z.string().min(3).max(80),
  text: z.string().min(20).max(500),
  tags: z.array(ScenarioTagSchema).min(1).max(3),
  difficulty: DifficultyLevelSchema,
  dayContext: GeneratedDayContextSchema,
  menuPrompt: z.string().min(10).max(200),
  choices: z.array(GeneratedChoiceSchema).min(2).max(4),
  menuOptions: z.array(GeneratedMenuOptionSchema).length(3),
});

export type GeneratedChoice = z.infer<typeof GeneratedChoiceSchema>;
export type GeneratedMenuOption = z.infer<typeof GeneratedMenuOptionSchema>;
export type GeneratedScenario = z.infer<typeof GeneratedScenarioSchema>;

function slugify(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36);
  return base ? `${base}-${index}` : `choice-${index}`;
}

function clampEffect(value: number, max: number): number {
  return Math.max(-max, Math.min(max, value));
}

function effectMagnitude(effects: ResourceEffects): number {
  return (
    Math.abs(effects.money ?? 0) +
    Math.abs(effects.reputation ?? 0) +
    Math.abs(effects.energy ?? 0)
  );
}

function scaleEffects(effects: ResourceEffects, factor: number): ResourceEffects {
  const scale = (n: number | undefined) =>
    n === undefined ? undefined : Math.round(n * factor);
  return {
    money: scale(effects.money),
    reputation: scale(effects.reputation),
    energy: scale(effects.energy),
  };
}

export function normalizeChoiceEffects(
  effects: ResourceEffects,
  difficulty: DifficultyLevel
): ResourceEffects {
  const max = DIFFICULTY_MAX_EFFECT[difficulty];
  let normalized: ResourceEffects = {
    money:
      effects.money !== undefined ? clampEffect(effects.money, max) : undefined,
    reputation:
      effects.reputation !== undefined
        ? clampEffect(effects.reputation, max)
        : undefined,
    energy:
      effects.energy !== undefined ? clampEffect(effects.energy, max) : undefined,
  };

  const magnitude = effectMagnitude(normalized);
  if (magnitude > MAX_IMPACT_PER_CHOICE) {
    normalized = scaleEffects(normalized, MAX_IMPACT_PER_CHOICE / magnitude);
  }

  return normalized;
}

type GeneratedEffects = z.infer<typeof GeneratedEffectsSchema>;

function choiceHasNegativeEffect(effects: GeneratedEffects): boolean {
  return effects.money < 0 || effects.reputation < 0 || effects.energy < 0;
}

function choiceHasPositiveEffect(effects: GeneratedEffects): boolean {
  return effects.money > 0 || effects.reputation > 0 || effects.energy > 0;
}

function effectsAreMixed(effects: GeneratedEffects): boolean {
  return choiceHasNegativeEffect(effects) && choiceHasPositiveEffect(effects);
}

/** Every option needs upsides and downsides — never all stats good or all bad */
function enforceMixedEffects(
  effects: GeneratedEffects,
  difficulty: DifficultyLevel
): GeneratedEffects {
  const max = DIFFICULTY_MAX_EFFECT[difficulty];
  let normalized = { ...effects };

  if (!choiceHasNegativeEffect(normalized)) {
    const energyPenalty = difficulty === 'early' ? -2 : difficulty === 'mid' ? -3 : -4;
    normalized = {
      ...normalized,
      energy: clampEffect(Math.min(normalized.energy, energyPenalty), max),
    };
  }

  if (!choiceHasPositiveEffect(normalized)) {
    const boost = difficulty === 'early' ? 4 : difficulty === 'mid' ? 5 : 6;
    if (normalized.reputation <= normalized.money) {
      normalized.reputation = clampEffect(
        Math.max(normalized.reputation, boost),
        max
      );
    } else {
      normalized.money = clampEffect(Math.max(normalized.money, boost), max);
    }
  }

  return normalized;
}

function preprocessGeneratedScenario(data: GeneratedScenario): GeneratedScenario {
  const { difficulty } = data;
  return {
    ...data,
    choices: data.choices.map((choice) => ({
      ...choice,
      effects: enforceMixedEffects(choice.effects, difficulty),
    })),
    menuOptions: data.menuOptions.map((option) => ({
      ...option,
      effects: enforceMixedEffects(option.effects, difficulty),
    })),
  };
}

function everyOptionHasMixedEffects(
  options: Array<{ effects: { money: number; reputation: number; energy: number } }>
): boolean {
  return options.every((o) => effectsAreMixed(o.effects));
}

function hasReasonableChoice(
  choices: GeneratedChoice[],
  difficulty: DifficultyLevel
): boolean {
  const max = DIFFICULTY_MAX_EFFECT[difficulty];
  return choices.some((choice) => {
    const e = normalizeChoiceEffects(choice.effects, difficulty);
    const money = e.money ?? 0;
    const reputation = e.reputation ?? 0;
    const energy = e.energy ?? 0;
    return money >= -max / 2 || reputation >= 0 || energy >= -max / 2;
  });
}

export function mapGeneratedToScenario(
  generated: GeneratedScenario,
  turn: number
): Scenario {
  const scenarioId = `ai-${turn}-${generateId()}`;
  const difficulty = generated.difficulty;

  const scenario: Scenario = {
    id: scenarioId,
    title: generated.title,
    text: generated.text,
    tags: generated.tags,
    difficulty,
    createdBy: 'ai',
    createdAt: new Date(),
    dayContext: generated.dayContext,
    menuPrompt: generated.menuPrompt,
    choices: generated.choices.map((choice, index) => ({
      id: slugify(choice.label, index + 1),
      label: choice.label,
      effects: normalizeChoiceEffects(choice.effects, difficulty),
      riskLevel: choice.riskLevel,
    })),
    menuOptions: generated.menuOptions.map((option, index) => ({
      id: slugify(option.label, index + 1),
      label: option.label,
      description: option.description,
      imageSearchTerm: option.imageSearchTerm,
      effects: normalizeChoiceEffects(option.effects, difficulty),
      verdictReason: option.verdictReason,
    })),
  };

  return ScenarioSchema.parse(scenario);
}

export function validateGeneratedScenario(
  raw: unknown
): { success: true; data: GeneratedScenario } | { success: false; error: string } {
  const parsed = GeneratedScenarioSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const data = preprocessGeneratedScenario(parsed.data);
  const { choices, menuOptions } = data;

  if (!everyOptionHasMixedEffects(choices)) {
    return {
      success: false,
      error:
        'Each business choice must mix positive and negative effects (never all good or all bad)',
    };
  }

  if (!everyOptionHasMixedEffects(menuOptions)) {
    return {
      success: false,
      error:
        'Each menu option must mix positive and negative effects (never all good or all bad)',
    };
  }

  if (!hasReasonableChoice(choices, data.difficulty)) {
    return {
      success: false,
      error: 'All business choices are excessively punitive',
    };
  }

  if (!menuOptionsHaveDistinctTiers(menuOptions, data.difficulty)) {
    return {
      success: false,
      error:
        'Menu options must form three distinct tiers (best / okay / bad fit) with clearly separated effects',
    };
  }

  return { success: true, data };
}
