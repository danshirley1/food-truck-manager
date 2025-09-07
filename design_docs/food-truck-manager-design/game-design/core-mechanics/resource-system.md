# Food Truck Manager - Resource System

## Core Resources
The game tracks three primary resources that represent different aspects of running a food truck:

### 1. Money (`cash`)
- **Range**: -999 to +999
- **Starting Value**: 100
- **Represents**: Financial health of the food truck business
- **Sources**: Customer sales, special events, tips
- **Drains**: Supplies, permits, equipment repairs, fines

### 2. Reputation (`reputation`)
- **Range**: 0 to 100
- **Starting Value**: 50
- **Represents**: Customer satisfaction and word-of-mouth marketing
- **Sources**: Quality service, special menu items, community engagement
- **Drains**: Poor service, health violations, customer complaints

### 3. Energy (`energy`)
- **Range**: 0 to 100
- **Starting Value**: 80
- **Represents**: Owner's physical and mental capacity to run the business
- **Sources**: Rest, hiring help, efficient processes
- **Drains**: Long hours, stressful situations, equipment failures

## Resource Interactions

### Synergy Effects
- **High Reputation + Money**: Unlock premium locations/events
- **High Energy**: Better decision-making options available
- **Balanced Resources**: Access to expansion opportunities

### Death Spirals
- **Low Energy**: Limited choices, poor decision quality
- **Low Reputation**: Fewer customers, reduced income
- **Negative Money**: Forced closure scenarios, desperate choices

## Effect Constraints

### Per-Turn Limits
- **Individual Effect**: Maximum ±20 per choice
- **Cumulative Turn**: Maximum ±30 total change per turn
- **Critical Events**: Can exceed normal limits (rare, dramatic scenarios)

### Clamping Rules
```typescript
// Pseudo-code for resource updates
function updateResource(current: number, change: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, current + change));
}
```

## Game End Conditions

### Failure States
- **Energy ≤ 0**: "Burnout - You're too exhausted to continue"
- **Reputation ≤ 0**: "Reputation Ruined - No customers will visit"
- **Money ≤ -500**: "Bankruptcy - You can't cover basic expenses"

### Success Conditions
- **Turn Limit**: Complete 15 turns successfully
- **Excellence**: Achieve 80+ in all resources
- **Millionaire**: Reach 500+ money (rare achievement)

### Victory Scoring
```
Base Score = (money + reputation + energy)
Bonus Multipliers:
- Balanced (all resources > 40): x1.2
- Excellence (all resources > 70): x1.5
- Legendary (all resources > 85): x2.0
```

## Turn Structure

### Turn Sequence
1. **Status Check**: Display current resources
2. **Scenario Generation**: AI creates contextual scenario
3. **Choice Presentation**: Show 2-4 options with visible effects
4. **Selection**: Player chooses option
5. **Resolution**: Apply effects and show changes
6. **End Check**: Evaluate win/loss conditions

### Turn Duration
- **Total Turns**: 15 (represents 15 days of operation)
- **Escalation**: Later turns have higher stakes and more complex scenarios

## Design Rationale

### Simplicity
- Only 3 resources to track - easy to understand and balance
- Clear numeric ranges - no complex calculations
- Visible effect previews - players can make informed decisions

### Tension
- Resources create natural trade-offs
- Multiple failure states prevent single-resource optimization
- Limited turns create urgency

### AI Integration
- Simple numeric effects are easy for AI to generate safely
- Clear bounds prevent AI from creating game-breaking scenarios
- Resource context gives AI rich material for scenario generation