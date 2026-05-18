/**
 * Zod validation schemas for Food Truck Manager
 * Ensures type safety and validates AI-generated content
 */

import { z } from 'zod';
import { TOTAL_TURNS } from './core';

export const ResourcesSchema = z.object({
  money: z.number().min(-999).max(999),
  reputation: z.number().min(0).max(100),
  energy: z.number().min(0).max(100),
});

export const ResourceEffectsSchema = z.object({
  money: z.number().min(-20).max(20).optional(),
  reputation: z.number().min(-20).max(20).optional(),
  energy: z.number().min(-20).max(20).optional(),
});

export const RiskLevelSchema = z.enum(['safe', 'moderate', 'risky']);

export const ChoiceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1).max(100),
  effects: ResourceEffectsSchema,
  riskLevel: RiskLevelSchema.optional(),
});

export const DifficultyLevelSchema = z.enum(['early', 'mid', 'late']);

export const ScenarioTagSchema = z.enum([
  'customer-service', 
  'supply-management', 
  'equipment',
  'permits', 
  'competition', 
  'weather', 
  'community-event',
  'crisis', 
  'expansion'
]);

export const DayContextSchema = z.object({
  location: z.string().min(5).max(120),
  crowdDetail: z.string().min(30).max(400),
  crowdVibe: z.string().min(10).max(120),
});

export const MenuOptionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(5).max(120),
  description: z.string().min(10).max(160),
  imagePrompt: z.string().min(20).max(400).optional(),
  effects: ResourceEffectsSchema,
  verdictReason: z.string().min(15).max(200),
  imageUrl: z.string().min(1).optional(),
});

export const MenuFeedbackSchema = z.object({
  turn: z.number().min(1).max(TOTAL_TURNS),
  menuLabel: z.string(),
  stars: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  message: z.string(),
  verdictReason: z.string(),
  menuEffects: ResourceEffectsSchema,
  menuImageUrl: z.string().min(1).optional(),
  imagePrompt: z.string().optional(),
  dayLocation: z.string().optional(),
});

export const ScenarioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(80),
  text: z.string().min(10).max(500),
  choices: z.array(ChoiceSchema).min(2).max(4),
  tags: z.array(ScenarioTagSchema),
  difficulty: DifficultyLevelSchema,
  createdBy: z.enum(['ai', 'static']),
  createdAt: z.date().optional(),
  dayContext: DayContextSchema,
  menuPrompt: z.string().min(10).max(200),
  menuOptions: z.array(MenuOptionSchema).length(3),
});

export const EndReasonSchema = z.enum(['victory', 'burnout', 'reputation-death', 'bankruptcy']);

export const AchievementCategorySchema = z.enum(['survival', 'excellence', 'strategy', 'collection']);

export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  unlockedAt: z.date().optional(),
  category: AchievementCategorySchema,
});

export const ChoiceRecordSchema = z.object({
  turn: z.number().min(1).max(TOTAL_TURNS),
  scenarioId: z.string(),
  choiceId: z.string(),
  effects: ResourceEffectsSchema,
  resourcesBefore: ResourcesSchema,
  resourcesAfter: ResourcesSchema,
  timestamp: z.date(),
  menuChoiceId: z.string().optional(),
  menuStars: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  businessEffects: ResourceEffectsSchema.optional(),
  menuEffects: ResourceEffectsSchema.optional(),
  dayLocation: z.string().optional(),
  dayCrowdVibe: z.string().optional(),
});

export const GameStateSchema = z.object({
  sessionId: z.string(),
  turn: z.number().min(0).max(TOTAL_TURNS),
  resources: ResourcesSchema,
  gameOver: z.boolean(),
  endReason: EndReasonSchema.optional(),
  score: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  randomSeed: z.string().optional(),
  chefsKudos: z.number().min(0),
  lastMenuFeedback: MenuFeedbackSchema.optional(),
  choiceHistory: z.array(ChoiceRecordSchema),
  achievements: z.array(AchievementSchema),
});

export const ScenarioContextSchema = z.object({
  currentResources: ResourcesSchema,
  turn: z.number().min(1).max(TOTAL_TURNS),
  difficultyLevel: DifficultyLevelSchema,
  recentChoices: z.array(z.string()),
  availableTags: z.array(ScenarioTagSchema),
  randomSeed: z.string().optional(),
  recentScenarioIds: z.array(z.string()).optional(),
  recentLocations: z.array(z.string()).optional(),
  recentCrowdVibes: z.array(z.string()).optional(),
  venueThemeHint: z.string().optional(),
  tone: z.enum(['light', 'standard']).optional(),
});