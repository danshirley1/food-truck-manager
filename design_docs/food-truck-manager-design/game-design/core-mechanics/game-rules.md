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
**Survive 15 Turns**: Successfully navigate 15 days of food truck operation without hitting any failure states.

### Bonus Achievements
- **Balanced Manager**: Never let any resource drop below 30
- **Customer Favorite**: Maintain reputation above 70 for final 5 turns
- **Profitable**: End with more than 200 money
- **Energetic**: End with more than 70 energy

## Failure Conditions

### Immediate Game Over
1. **Burnout**: Energy drops to 0 or below
2. **Reputation Death**: Reputation drops to 0 or below  
3. **Bankruptcy**: Money drops to -500 or below

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
- **Risk Level**: Some choices have uncertain outcomes

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

### Early Game (Turns 1-5)
- **Stakes**: Low-impact decisions (-5 to +10 effects)
- **Scenarios**: Basic operations, simple customer interactions
- **Focus**: Learning the ropes, establishing routine

### Mid Game (Turns 6-10)
- **Stakes**: Medium-impact decisions (-10 to +15 effects)
- **Scenarios**: Equipment issues, permit renewals, competition
- **Focus**: Optimization and crisis management

### Late Game (Turns 11-15)
- **Stakes**: High-impact decisions (-15 to +20 effects)
- **Scenarios**: Major events, expansion opportunities, critical choices
- **Focus**: Strategic thinking under pressure

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