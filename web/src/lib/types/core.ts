/**
 * Core data models for Food Truck Manager game
 * Based on design documentation at design_docs/food-truck-manager-design/
 */

/** Number of playable days before victory */
export const TOTAL_TURNS = 5;

/** Last turn in the early difficulty band (inclusive) */
export const EARLY_TURN_END = Math.ceil(TOTAL_TURNS / 3);

/** Last turn in the mid difficulty band (inclusive) */
export const MID_TURN_END = Math.ceil((TOTAL_TURNS * 2) / 3);

/** Day number shown in the UI (1-based, capped at TOTAL_TURNS) */
export function displayDay(turn: number): number {
  if (turn <= 0) return 1;
  return Math.min(turn, TOTAL_TURNS);
}

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

export interface DayContext {
  location: string;
  crowdDetail: string;
  crowdVibe: string;
}

export interface MenuOption {
  id: string;
  label: string;
  /** Short appetizing blurb shown on the menu card (no stats or spoilers) */
  description: string;
  /** Used server-side / client fetch for image generation; not shown in UI */
  imagePrompt?: string;
  effects: ResourceEffects;
  /** One sentence shown after serve — why this special fit or flopped */
  verdictReason: string;
  imageUrl?: string;
}

export interface MenuFeedback {
  turn: number;
  menuLabel: string;
  stars: 1 | 2 | 3;
  message: string;
  verdictReason: string;
  menuEffects: ResourceEffects;
  menuImageUrl?: string;
  /** Used to generate verdict image if the player submitted before the card loaded */
  imagePrompt?: string;
  dayLocation?: string;
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
  dayContext: DayContext;
  menuPrompt: string;
  menuOptions: MenuOption[];
}

export interface ChoiceRecord {
  turn: number;
  scenarioId: string;
  choiceId: string;
  effects: ResourceEffects;
  resourcesBefore: Resources;
  resourcesAfter: Resources;
  timestamp: Date;
  menuChoiceId?: string;
  menuStars?: 1 | 2 | 3;
  businessEffects?: ResourceEffects;
  menuEffects?: ResourceEffects;
  dayLocation?: string;
  dayCrowdVibe?: string;
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
  turn: number;                // 0 = pre-start lobby; 1–TOTAL_TURNS = current day in play
  resources: Resources;        // Current resource levels
  gameOver: boolean;          // True if game ended
  endReason?: EndReason;      // Why game ended (if gameOver)
  score?: number;             // Final calculated score
  createdAt: Date;            // Session start time
  updatedAt: Date;            // Last update time
  randomSeed?: string;        // For deterministic scenarios
  
  chefsKudos: number;
  lastMenuFeedback?: MenuFeedback;

  // Game history
  choiceHistory: ChoiceRecord[];
  achievements: Achievement[];
}

// Enumerations
export type EndReason = 
  | 'victory'          // Completed all TOTAL_TURNS
  | 'burnout'         // Energy reached 0
  | 'reputation-death' // Reputation reached 0  
  | 'bankruptcy';     // Money dropped below -500

export type RiskLevel = 
  | 'safe'            // Guaranteed effects
  | 'moderate'        // Small variance possible
  | 'risky';          // Large variance possible

export type DifficultyLevel = 
  | 'early'           // First third of the run
  | 'mid'             // Middle third
  | 'late';           // Final third

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
  recentScenarioIds?: string[]; // Avoid repeating AI scenarios
  recentLocations?: string[];
  recentCrowdVibes?: string[];
  venueThemeHint?: string;
  tone?: 'light' | 'standard';
}