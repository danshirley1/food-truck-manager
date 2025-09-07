"use strict";
/**
 * Zod validation schemas for Food Truck Manager
 * Ensures type safety and validates AI-generated content
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioContextSchema = exports.GameStateSchema = exports.ChoiceRecordSchema = exports.AchievementSchema = exports.AchievementCategorySchema = exports.EndReasonSchema = exports.ScenarioSchema = exports.ScenarioTagSchema = exports.DifficultyLevelSchema = exports.ChoiceSchema = exports.RiskLevelSchema = exports.ResourceEffectsSchema = exports.ResourcesSchema = void 0;
const zod_1 = require("zod");
exports.ResourcesSchema = zod_1.z.object({
    money: zod_1.z.number().min(-999).max(999),
    reputation: zod_1.z.number().min(0).max(100),
    energy: zod_1.z.number().min(0).max(100),
});
exports.ResourceEffectsSchema = zod_1.z.object({
    money: zod_1.z.number().min(-20).max(20).optional(),
    reputation: zod_1.z.number().min(-20).max(20).optional(),
    energy: zod_1.z.number().min(-20).max(20).optional(),
});
exports.RiskLevelSchema = zod_1.z.enum(['safe', 'moderate', 'risky']);
exports.ChoiceSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[a-z0-9-]+$/),
    label: zod_1.z.string().min(1).max(100),
    effects: exports.ResourceEffectsSchema,
    riskLevel: exports.RiskLevelSchema.optional(),
});
exports.DifficultyLevelSchema = zod_1.z.enum(['early', 'mid', 'late']);
exports.ScenarioTagSchema = zod_1.z.enum([
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
exports.ScenarioSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    title: zod_1.z.string().min(3).max(80),
    text: zod_1.z.string().min(10).max(500),
    choices: zod_1.z.array(exports.ChoiceSchema).min(2).max(4),
    tags: zod_1.z.array(exports.ScenarioTagSchema),
    difficulty: exports.DifficultyLevelSchema,
    createdBy: zod_1.z.enum(['ai', 'static']),
    createdAt: zod_1.z.date().optional(),
});
exports.EndReasonSchema = zod_1.z.enum(['victory', 'burnout', 'reputation-death', 'bankruptcy']);
exports.AchievementCategorySchema = zod_1.z.enum(['survival', 'excellence', 'strategy', 'collection']);
exports.AchievementSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    unlockedAt: zod_1.z.date().optional(),
    category: exports.AchievementCategorySchema,
});
exports.ChoiceRecordSchema = zod_1.z.object({
    turn: zod_1.z.number().min(1).max(15),
    scenarioId: zod_1.z.string(),
    choiceId: zod_1.z.string(),
    effects: exports.ResourceEffectsSchema,
    resourcesBefore: exports.ResourcesSchema,
    resourcesAfter: exports.ResourcesSchema,
    timestamp: zod_1.z.date(),
});
exports.GameStateSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    turn: zod_1.z.number().min(0).max(15),
    resources: exports.ResourcesSchema,
    gameOver: zod_1.z.boolean(),
    endReason: exports.EndReasonSchema.optional(),
    score: zod_1.z.number().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    randomSeed: zod_1.z.string().optional(),
    choiceHistory: zod_1.z.array(exports.ChoiceRecordSchema),
    achievements: zod_1.z.array(exports.AchievementSchema),
});
exports.ScenarioContextSchema = zod_1.z.object({
    currentResources: exports.ResourcesSchema,
    turn: zod_1.z.number().min(1).max(15),
    difficultyLevel: exports.DifficultyLevelSchema,
    recentChoices: zod_1.z.array(zod_1.z.string()),
    availableTags: zod_1.z.array(exports.ScenarioTagSchema),
    randomSeed: zod_1.z.string().optional(),
});
//# sourceMappingURL=validation.js.map