/**
 * Core data models for Food Truck Manager game
 * Based on design documentation at design_docs/food-truck-manager-design/
 */

export interface Resources {
  money: number;        // -999 to 999
  reputation: number;   // 0 to 100  
  energy: number;       // 0 to 100
}

export interface ResourceEffects {
  money?: number;       // Optional delta (-20 to +20)
  reputation?: number;  // Optional delta (-20 to +20)
  energy?: number;      // Optional delta (-20 to +20)
}

export interface Choice {
  id: string;              // Unique identifier (kebab-case)
  label: string;           // Display text for the choice
  effects: ResourceEffects; // Resource changes
  riskLevel?: RiskLevel;   // Hint about uncertainty
}

export interface Scenario {
  id: string;              // Unique identifier
  title: string;           // Short scenario title
  text: string;            // Scenario description
  choices: Choice[];       // Available options (2-4)
  tags: ScenarioTag[];     // Categorization tags
  difficulty: DifficultyLevel; // Appropriate turn range
  createdBy: 'ai' | 'static'; // Generation method
  createdAt?: Date;        // Generation timestamp
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
  id: string;              // Unique identifier
  name: string;            // Display name
  description: string;     // Achievement description
  unlockedAt?: Date;      // When achievement was earned
  category: AchievementCategory;
}

export interface GameState {
  sessionId: string;           // Unique session identifier
  turn: number;                // Current turn (1-15)
  resources: Resources;        // Current resource levels
  gameOver: boolean;          // True if game ended
  endReason?: EndReason;      // Why game ended (if gameOver)
  score?: number;             // Final calculated score
  createdAt: Date;            // Session start time
  updatedAt: Date;            // Last update time
  randomSeed?: string;        // For deterministic scenarios
  
  // Game history
  choiceHistory: ChoiceRecord[];
  achievements: Achievement[];
}

// Enumerations
export type EndReason = 
  | 'victory'          // Completed all 15 turns
  | 'burnout'         // Energy reached 0
  | 'reputation-death' // Reputation reached 0  
  | 'bankruptcy';     // Money dropped below -500

export type RiskLevel = 
  | 'safe'            // Guaranteed effects
  | 'moderate'        // Small variance possible
  | 'risky';          // Large variance possible

export type DifficultyLevel = 
  | 'early'           // Turns 1-5
  | 'mid'             // Turns 6-10
  | 'late';           // Turns 11-15

export type ScenarioTag = 
  | 'customer-service'
  | 'supply-management'
  | 'equipment'
  | 'permits'
  | 'competition'
  | 'weather'
  | 'community-event'
  | 'crisis'
  | 'expansion';

export type AchievementCategory = 
  | 'survival'       // Basic completion achievements
  | 'excellence'     // High performance achievements
  | 'strategy'       // Specific play style achievements
  | 'collection';    // Meta achievements

// Utility types
export interface ScenarioContext {
  currentResources: Resources;
  turn: number;
  difficultyLevel: DifficultyLevel;
  recentChoices: string[];      // Last 3 scenario tags
  availableTags: ScenarioTag[]; // Allowed scenario types
  randomSeed?: string;          // For deterministic generation
}