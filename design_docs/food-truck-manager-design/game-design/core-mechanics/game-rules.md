# Food Truck Manager - Game Rules

## Core Game Loop

### Game Flow
```
Start Game → Generate Scenario → Present Choices → Apply Effects → Check End Conditions
     ↑                                                                      ↓
     └─────────────── Continue (if game not over) ←─────────────────────────┘
```

## Victory Conditions

### Primary Win Condition
**Survive 5 Turns**: Successfully navigate 5 days of food truck operation without hitting any failure states. (`TOTAL_TURNS` in `web/src/lib/types/core.ts`.)

### Bonus Achievements
- **Balanced Manager**: Never let any resource drop below 30
- **Customer Favorite**: Maintain reputation above 70 for final 5 turns
- **Profitable**: End with more than 200 money
- **Energetic**: End with more than 70 energy

## Failure Conditions

### Immediate Game Over
1. **Burnout**: Energy drops to 0 or below
2. **Reputation Death**: Reputation drops to 0 or below  
3. **Bankruptcy**: Money drops to 0 or below

### Failure Messaging
Each failure state has specific narrative endings:
- **Burnout**: "You collapse from exhaustion. The food truck dream will have to wait."
- **Reputation Death**: "Word spreads about your poor service. No one comes to your truck anymore."
- **Bankruptcy**: "You can't afford supplies or permits. Time to close down."

## Choice Mechanics

### Choice Structure
Each scenario presents 2-4 options with:
- **Description**: Clear narrative of the action
- **Visible Effects**: Preview of resource changes (e.g., "Money: -10, Reputation: +15")
- **Effect badges**: Money, reputation, and energy deltas (each option must mix positive and negative effects)
- **Risk level**: Stored in AI output for schema only; not shown to the player

### Effect Application
```typescript
// Simplified rule application
function applyChoice(gameState: GameState, choice: Choice): GameState {
  const newState = { ...gameState };
  
  // Apply effects with bounds checking
  newState.money = clamp(newState.money + choice.effects.money, -999, 999);
  newState.reputation = clamp(newState.reputation + choice.effects.reputation, 0, 100);
  newState.energy = clamp(newState.energy + choice.effects.energy, 0, 100);
  
  // Increment turn
  newState.turn += 1;
  
  // Check end conditions
  newState.gameOver = checkEndConditions(newState);
  
  return newState;
}
```

## Difficulty Progression

### Early Game (Days 1–2)
- **Stakes**: Lower caps (early ±10 per field)
- **Scenarios**: Basic operations, simple customer interactions
- **Focus**: Learning the ropes

### Mid Game (Days 3–4)
- **Stakes**: Mid caps (±15 per field)
- **Scenarios**: Equipment, permits, competition
- **Focus**: Tradeoffs and crisis management

### Late Game (Day 5)
- **Stakes**: Late caps (±20 per field)
- **Scenarios**: High-stakes events, make-or-break choices
- **Focus**: Closing out the run

Bands are computed from `TOTAL_TURNS` in code (`EARLY_TURN_END`, `MID_TURN_END`).

## Scenario Categories

### Daily Operations
- Customer service situations
- Supply management
- Equipment maintenance
- Staff interactions (if hired)

### External Events
- Permit inspections
- Weather challenges
- Competition encounters
- Community events

### Crisis Management
- Equipment failures
- Health department visits
- Difficult customers
- Supply shortages

## Scoring System

### Base Score Calculation
```
Final Score = (Money × 0.4) + (Reputation × 0.8) + (Energy × 0.6) + Turn Bonus
Turn Bonus = Turns Completed × 10
```

### Score Multipliers
- **Balanced Finish**: All resources above 40 → ×1.2
- **Excellence Finish**: All resources above 70 → ×1.5
- **Perfect Run**: No resource below 50 at any point → ×1.3
- **Achievement Bonuses**: +50 points per achievement unlocked

### Leaderboard Categories
- **Highest Score**: Traditional high score
- **Best Balanced**: Highest minimum resource at game end
- **Most Profitable**: Highest money total
- **Customer Champion**: Highest reputation total

## Game State Persistence

### Session Data
- Current resources (money, reputation, energy)
- Turn number
- Choice history (for replay/analysis)
- Achievements unlocked
- Random seed (for deterministic replays)

### Cross-Session Data (Phase 2)
- Best scores per category
- Total games played
- Favorite scenario types
- Achievement collection