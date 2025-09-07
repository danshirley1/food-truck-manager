# Food Truck Manager - AI Integration Strategy

## AI Role Definition

### What AI Generates
- **Scenario Narratives**: Creative situation descriptions based on game context
- **Choice Labels**: Natural language options for player decisions
- **Flavor Text**: Immersive descriptions that maintain food truck theme
- **Contextual Variations**: Different scenarios for similar game states

### What AI Does NOT Control
- **Resource Effects**: Numeric impacts are bounded and validated
- **Game Rules**: Win/loss conditions, turn progression, scoring
- **Core Logic**: State management, validation, persistence
- **Critical Paths**: Essential game flow decisions

## AI Service Architecture

### Phase 1: CLI Implementation
```typescript
interface AIService {
  generateScenario(context: ScenarioContext): Promise<Scenario>;
  validateContent(content: string): Promise<boolean>;
  retryGeneration(context: ScenarioContext, attempt: number): Promise<Scenario>;
}
```

### Phase 2: AWS Integration
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Lambda        │────│   OpenAI API     │────│   Bedrock       │
│   AI Service    │    │   (Initial)      │    │   (Migration)   │
│                 │    │                  │    │                 │
│ - Generate      │    │ - GPT-3.5-turbo  │    │ - Claude-3      │
│ - Validate      │    │ - Content Policy │    │ - Guardrails    │
│ - Cache         │    │ - Rate Limiting  │    │ - Cost Control  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Prompt Engineering Strategy

### System Prompt Template
```typescript
const SYSTEM_PROMPT = `You are a content generator for a family-friendly food truck management game.

RULES:
- Generate only safe-for-work content appropriate for all audiences
- Stay within the food truck business theme
- Output must be valid JSON matching the provided schema
- Resource effects must be realistic and bounded (-20 to +20)
- Scenarios should be engaging but not dramatic
- Keep language professional and approachable

THEME CONTEXT:
- Player runs a food truck business
- Game tracks money, reputation, and energy
- Scenarios involve permits, customers, supplies, equipment, competition
- Each choice should feel meaningful but not game-breaking`;
```

### Context-Aware Generation
```typescript
interface ScenarioContext {
  currentResources: Resources;
  turn: number;
  difficultyLevel: DifficultyLevel;
  recentChoices: string[];      // Last 3 scenario tags
  availableTags: ScenarioTag[]; // Allowed scenario types
  randomSeed?: string;          // For deterministic generation
}

const USER_PROMPT = (context: ScenarioContext) => `
Current game state:
- Money: ${context.currentResources.money}
- Reputation: ${context.currentResources.reputation}  
- Energy: ${context.currentResources.energy}
- Turn: ${context.turn}/15
- Difficulty: ${context.difficultyLevel}

Recent scenario types: ${context.recentChoices.join(', ')}

Generate a ${context.difficultyLevel} difficulty scenario with 2-4 choices.
Scenario should be relevant to current resources and avoid repeating recent types.

JSON Schema:
${JSON.stringify(SCENARIO_SCHEMA, null, 2)}

Return ONLY valid JSON.`;
```

## Content Safety & Validation

### Multi-Layer Validation
```typescript
async function generateSafeScenario(context: ScenarioContext): Promise<Scenario> {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1. AI Generation
      const rawResponse = await aiService.generate(buildPrompt(context));
      
      // 2. JSON Parsing
      const parsed = JSON.parse(rawResponse);
      
      // 3. Schema Validation
      const validated = ScenarioSchema.parse(parsed);
      
      // 4. Content Moderation
      const contentSafe = await moderateContent(validated);
      if (!contentSafe) throw new Error('Content moderation failed');
      
      // 5. Effect Bounds Check
      const effectsSafe = validateEffectBounds(validated);
      if (!effectsSafe) throw new Error('Effects exceed bounds');
      
      return validated;
      
    } catch (error) {
      if (attempt === maxRetries) {
        // Fall back to static scenario
        return getStaticFallbackScenario(context);
      }
      
      // Retry with stricter prompt
      context = addStricterConstraints(context, error.message);
    }
  }
}
```

### Content Moderation Pipeline
```typescript
interface ContentModerationResult {
  safe: boolean;
  flags: string[];
  confidence: number;
}

async function moderateContent(scenario: Scenario): Promise<ContentModerationResult> {
  const allText = [
    scenario.title,
    scenario.text,
    ...scenario.choices.map(c => c.label)
  ].join('\n');
  
  // Multiple moderation checks
  const checks = await Promise.all([
    openAIModerationCheck(allText),
    profanityFilterCheck(allText),
    businessAppropriatenessCheck(allText),
    thematicConsistencyCheck(scenario)
  ]);
  
  return {
    safe: checks.every(c => c.safe),
    flags: checks.flatMap(c => c.flags),
    confidence: Math.min(...checks.map(c => c.confidence))
  };
}
```

## Fallback Strategies

### Static Scenario Library
```typescript
// Curated scenarios for fallback and seeding
const STATIC_SCENARIOS: Record<DifficultyLevel, Scenario[]> = {
  early: [
    {
      id: "first-customer",
      title: "Your First Customer",
      text: "A friendly local approaches your truck with a big smile. They're excited to try your food but seem unsure about what to order.",
      choices: [
        {
          id: "recommend-special",
          label: "Recommend today's special",
          effects: { reputation: 8, energy: -3 }
        },
        {
          id: "let-them-browse",
          label: "Let them browse the menu",
          effects: { reputation: 3, energy: -1 }
        }
      ],
      tags: ["customer-service"],
      difficulty: "early",
      createdBy: "static"
    }
    // ... more static scenarios
  ],
  // ... mid and late scenarios
};
```

### Hybrid Generation Approach
```typescript
enum GenerationStrategy {
  AI_FIRST = "ai_first",           // Try AI, fallback to static
  STATIC_FIRST = "static_first",   // Use static, enhance with AI
  MIXED = "mixed"                  // Blend AI and static content
}

async function generateScenario(context: ScenarioContext): Promise<Scenario> {
  const strategy = determineGenerationStrategy(context);
  
  switch (strategy) {
    case GenerationStrategy.AI_FIRST:
      return await generateSafeScenario(context);
      
    case GenerationStrategy.STATIC_FIRST:
      const base = selectStaticScenario(context);
      return await enhanceWithAI(base, context);
      
    case GenerationStrategy.MIXED:
      return await blendStaticAndAI(context);
  }
}
```

## Performance & Caching

### Scenario Caching Strategy
```typescript
interface ScenarioCacheKey {
  difficultyLevel: DifficultyLevel;
  resourceRange: ResourceRange;    // Bucketed resource levels
  tagPreference: ScenarioTag;
  seed?: string;
}

class ScenarioCache {
  private cache = new Map<string, Scenario[]>();
  
  async warmCache(): Promise<void> {
    // Pre-generate common scenarios during off-peak times
    const commonContexts = generateCommonContexts();
    
    for (const context of commonContexts) {
      const scenarios = await generateBatch(context, 3);
      const key = this.buildCacheKey(context);
      this.cache.set(key, scenarios);
    }
  }
  
  async getScenario(context: ScenarioContext): Promise<Scenario> {
    const key = this.buildCacheKey(context);
    const cached = this.cache.get(key) || [];
    
    if (cached.length > 0) {
      return cached.pop()!; // Use and remove from cache
    }
    
    // Generate on-demand if cache miss
    return await generateSafeScenario(context);
  }
}
```

## Cost Management

### AI Usage Optimization
- **Batch Generation**: Create multiple scenarios per API call
- **Smart Caching**: Cache by context similarity, not exact match
- **Token Management**: Optimize prompts for minimal token usage
- **Rate Limiting**: Prevent runaway generation costs
- **Budget Alerts**: Monitor and cap monthly AI spend

### Cost Estimation
```typescript
// Estimated costs (as of 2024)
const COST_ESTIMATES = {
  openai_gpt35_turbo: {
    input: 0.0015,  // per 1K tokens
    output: 0.002,  // per 1K tokens
    avgTokensPerScenario: 800
  },
  aws_bedrock_claude: {
    input: 0.0008,  // per 1K tokens  
    output: 0.0024, // per 1K tokens
    avgTokensPerScenario: 750
  }
};
```