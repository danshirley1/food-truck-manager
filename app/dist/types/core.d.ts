/**
 * Core data models for Food Truck Manager game
 * Based on design documentation at design_docs/food-truck-manager-design/
 */
export interface Resources {
    money: number;
    reputation: number;
    energy: number;
}
export interface ResourceEffects {
    money?: number;
    reputation?: number;
    energy?: number;
}
export interface Choice {
    id: string;
    label: string;
    effects: ResourceEffects;
    riskLevel?: RiskLevel;
}
export interface Scenario {
    id: string;
    title: string;
    text: string;
    choices: Choice[];
    tags: ScenarioTag[];
    difficulty: DifficultyLevel;
    createdBy: 'ai' | 'static';
    createdAt?: Date;
}
export interface ChoiceRecord {
    turn: number;
    scenarioId: string;
    choiceId: string;
    effects: ResourceEffects;
    resourcesBefore: Resources;
    resourcesAfter: Resources;
    timestamp: Date;
}
export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlockedAt?: Date;
    category: AchievementCategory;
}
export interface GameState {
    sessionId: string;
    turn: number;
    resources: Resources;
    gameOver: boolean;
    endReason?: EndReason;
    score?: number;
    createdAt: Date;
    updatedAt: Date;
    randomSeed?: string;
    choiceHistory: ChoiceRecord[];
    achievements: Achievement[];
}
export type EndReason = 'victory' | 'burnout' | 'reputation-death' | 'bankruptcy';
export type RiskLevel = 'safe' | 'moderate' | 'risky';
export type DifficultyLevel = 'early' | 'mid' | 'late';
export type ScenarioTag = 'customer-service' | 'supply-management' | 'equipment' | 'permits' | 'competition' | 'weather' | 'community-event' | 'crisis' | 'expansion';
export type AchievementCategory = 'survival' | 'excellence' | 'strategy' | 'collection';
export interface ScenarioContext {
    currentResources: Resources;
    turn: number;
    difficultyLevel: DifficultyLevel;
    recentChoices: string[];
    availableTags: ScenarioTag[];
    randomSeed?: string;
}
//# sourceMappingURL=core.d.ts.map