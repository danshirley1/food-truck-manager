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
import type { DifficultyLevel } from './core';

const GeneratedEffectsSchema = z.object({
  money: z.number().min(-20).max(20),
  reputation: z.number().min(-20).max(20),
  energy: z.number().min(-20).max(20),
});

export const GeneratedChoiceSchema = z.object({
  label: z.string().min(5).max(120),
  effects: GeneratedEffectsSchema,
  riskLevel: RiskLevelSchema,
});

export const GeneratedScenarioSchema = z.object({
  title: z.string().min(3).max(80),
  text: z.string().min(20).max(500),
  tags: z.array(ScenarioTagSchema).min(1).max(3),
  difficulty: DifficultyLevelSchema,
  choices: z.array(GeneratedChoiceSchema).min(2).max(4),
});

export type GeneratedChoice = z.infer<typeof GeneratedChoiceSchema>;
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

function choiceHasNegativeEffect(effects: GeneratedChoice['effects']): boolean {
  return effects.money < 0 || effects.reputation < 0 || effects.energy < 0;
}

function everyChoiceHasTradeoff(choices: GeneratedChoice[]): boolean {
  return choices.every((choice) => choiceHasNegativeEffect(choice.effects));
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

  const scenario: Scenario = {
    id: scenarioId,
    title: generated.title,
    text: generated.text,
    tags: generated.tags,
    difficulty: generated.difficulty,
    createdBy: 'ai',
    createdAt: new Date(),
    choices: generated.choices.map((choice, index) => ({
      id: slugify(choice.label, index + 1),
      label: choice.label,
      effects: normalizeChoiceEffects(choice.effects, generated.difficulty),
      riskLevel: choice.riskLevel,
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

  if (!everyChoiceHasTradeoff(parsed.data.choices)) {
    return {
      success: false,
      error: 'Each choice must include at least one negative effect',
    };
  }

  if (!hasReasonableChoice(parsed.data.choices, parsed.data.difficulty)) {
    return {
      success: false,
      error: 'All choices are excessively punitive',
    };
  }

  return { success: true, data: parsed.data };
}
