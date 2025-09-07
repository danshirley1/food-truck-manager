# Food Truck Manager - Core Data Models

## TypeScript Type Definitions

### Resource Management
```typescript
/**
 * Core resources tracked throughout the game
 */
export interface Resources {
  money: number;        // -999 to 999
  reputation: number;   // 0 to 100  
  energy: number;       // 0 to 100
}

/**
 * Resource changes from player choices
 */
export interface ResourceEffects {
  money?: number;       // Optional delta (-20 to +20)
  reputation?: number;  // Optional delta (-20 to +20)
  energy?: number;      // Optional delta (-20 to +20)
}
```

### Game State
```typescript
/**
 * Complete game session state
 */
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

/**
 * Record of a single choice made during the game
 */
export interface ChoiceRecord {
  turn: number;
  scenarioId: string;
  choiceId: string;
  effects: ResourceEffects;
  resourcesBefore: Resources;
  resourcesAfter: Resources;
  timestamp: Date;
}
```

### Scenario System
```typescript
/**
 * A single choice within a scenario
 */
export interface Choice {
  id: string;              // Unique identifier (kebab-case)
  label: string;           // Display text for the choice
  effects: ResourceEffects; // Resource changes
  riskLevel?: RiskLevel;   // Hint about uncertainty
}

/**
 * AI-generated or predefined game scenario
 */
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
```

### Enumerations
```typescript
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
```

### Achievement System
```typescript
/**
 * Unlockable achievements for player engagement
 */
export interface Achievement {
  id: string;              // Unique identifier
  name: string;            // Display name
  description: string;     // Achievement description
  unlockedAt?: Date;      // When achievement was earned
  category: AchievementCategory;
}

export type AchievementCategory = 
  | 'survival'       // Basic completion achievements
  | 'excellence'     // High performance achievements
  | 'strategy'       // Specific play style achievements
  | 'collection';    // Meta achievements
```

## Validation Schemas (Zod)

### Runtime Validation
```typescript
import { z } from 'zod';

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

export const ChoiceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1).max(100),
  effects: ResourceEffectsSchema,
  riskLevel: z.enum(['safe', 'moderate', 'risky']).optional(),
});

export const ScenarioSchema = z.object({
  id: z.string(),
  title: z.string().min(3).max(80),
  text: z.string().min(10).max(500),
  choices: z.array(ChoiceSchema).min(2).max(4),
  tags: z.array(z.enum([
    'customer-service', 'supply-management', 'equipment',
    'permits', 'competition', 'weather', 'community-event',
    'crisis', 'expansion'
  ])),
  difficulty: z.enum(['early', 'mid', 'late']),
  createdBy: z.enum(['ai', 'static']),
});
```

## Data Storage Considerations

### Phase 1 (CLI)
- **In-Memory**: Game state exists only during session
- **Optional Persistence**: JSON file for save/load functionality
- **Scenario Cache**: Pre-generated scenarios in JSON files

### Phase 2 (Web)
- **DynamoDB**: Session state with TTL for cleanup
- **S3**: Static scenario templates and cached AI generations
- **ElastiCache**: Hot scenario cache for performance

### Storage Patterns
```typescript
// DynamoDB table structure
interface DynamoGameSession {
  PK: string;           // "SESSION#${sessionId}"
  SK: string;           // "METADATA" 
  gameState: GameState; // Full game state JSON
  ttl: number;          // Auto-cleanup timestamp
  gsi1pk?: string;      // "USER#${userId}" for user sessions
  gsi1sk?: string;      // createdAt for sorting
}

// Scenario cache structure  
interface DynamoScenario {
  PK: string;           // "SCENARIO#${difficulty}#${tag}"
  SK: string;           // scenario.id
  scenario: Scenario;   // Full scenario JSON
  ttl?: number;         // Optional cleanup for AI-generated
}
```