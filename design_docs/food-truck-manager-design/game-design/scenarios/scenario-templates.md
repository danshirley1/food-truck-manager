# Food Truck Manager - Scenario Templates

## Scenario Structure Guidelines

### Template Format
```json
{
  "id": "kebab-case-identifier",
  "title": "Short Descriptive Title",
  "text": "Engaging scenario description that sets up the situation and provides context for decision making.",
  "choices": [
    {
      "id": "choice-action-name",
      "label": "Clear action description",
      "effects": {
        "money": 0,
        "reputation": 0, 
        "energy": 0
      }
    }
  ],
  "tags": ["scenario-category"],
  "difficulty": "early|mid|late",
  "createdBy": "static|ai"
}
```

## Scenario Categories by Difficulty

### Early Game Templates (Turns 1-5)

#### Customer Service Scenarios
```json
{
  "id": "indecisive-customer",
  "title": "The Indecisive Customer",
  "text": "A customer has been staring at your menu for five minutes, holding up the line. Other customers are starting to look impatient.",
  "choices": [
    {
      "id": "offer-recommendation", 
      "label": "Politely offer a recommendation",
      "effects": { "reputation": 6, "energy": -2 }
    },
    {
      "id": "give-more-time",
      "label": "Give them more time to decide", 
      "effects": { "reputation": 2, "energy": -4 }
    },
    {
      "id": "suggest-popular-item",
      "label": "Point out your most popular item",
      "effects": { "money": 5, "reputation": 4, "energy": -1 }
    }
  ],
  "tags": ["customer-service"],
  "difficulty": "early",
  "createdBy": "static"
}
```

#### Supply Management
```json
{
  "id": "ingredient-shortage",
  "title": "Running Low on Supplies", 
  "text": "You're running low on your signature sauce with 3 hours left in your shift. You have enough for maybe 10 more orders.",
  "choices": [
    {
      "id": "close-early",
      "label": "Close early to preserve quality",
      "effects": { "reputation": 8, "money": -15, "energy": 5 }
    },
    {
      "id": "stretch-ingredients",
      "label": "Water down the sauce to last longer",
      "effects": { "reputation": -8, "money": 8, "energy": -3 }
    },
    {
      "id": "quick-store-run", 
      "label": "Make a quick run to the grocery store",
      "effects": { "money": -12, "energy": -6, "reputation": 2 }
    }
  ],
  "tags": ["supply-management"],
  "difficulty": "early", 
  "createdBy": "static"
}
```

### Mid Game Templates (Turns 6-10)

#### Equipment Issues
```json
{
  "id": "grill-malfunction",
  "title": "Grill Temperature Issues",
  "text": "Your main grill is running too hot and has already burned two orders. The lunch rush is starting and you need to act fast.",
  "choices": [
    {
      "id": "call-repair-service",
      "label": "Call emergency repair service",
      "effects": { "money": -35, "reputation": 5, "energy": -8 }
    },
    {
      "id": "adjust-manually",
      "label": "Try to adjust temperature manually", 
      "effects": { "reputation": -5, "energy": -12 }
    },
    {
      "id": "switch-to-backup",
      "label": "Switch to backup cooking equipment",
      "effects": { "money": -5, "reputation": -2, "energy": -6 }
    }
  ],
  "tags": ["equipment"],
  "difficulty": "mid",
  "createdBy": "static"
}
```

#### Competition Scenarios
```json
{
  "id": "new-competitor",
  "title": "New Food Truck Arrives",
  "text": "A flashy new food truck has set up nearby with lower prices and is drawing away your regular customers.",
  "choices": [
    {
      "id": "price-match",
      "label": "Lower your prices to compete",
      "effects": { "money": -8, "reputation": 3, "energy": -4 }
    },
    {
      "id": "improve-quality", 
      "label": "Focus on superior quality and service",
      "effects": { "money": -10, "reputation": 12, "energy": -6 }
    },
    {
      "id": "find-new-location",
      "label": "Move to a different location",
      "effects": { "money": -15, "energy": -8, "reputation": -3 }
    }
  ],
  "tags": ["competition"],
  "difficulty": "mid",
  "createdBy": "static"
}
```

### Late Game Templates (Turns 11-15)

#### High-Stakes Events
```json
{
  "id": "food-festival-opportunity",
  "title": "Last-Minute Festival Invitation",
  "text": "The city's biggest food festival has a last-minute cancellation. You're offered the spot, but it requires immediate payment and all your energy for setup.",
  "choices": [
    {
      "id": "take-opportunity",
      "label": "Pay the fee and participate",
      "effects": { "money": -50, "reputation": 25, "energy": -15 }
    },
    {
      "id": "negotiate-payment",
      "label": "Try to negotiate a payment plan",
      "effects": { "money": -25, "reputation": 15, "energy": -12 }
    },
    {
      "id": "decline-politely",
      "label": "Decline and focus on regular service",
      "effects": { "money": 10, "reputation": -5, "energy": 2 }
    }
  ],
  "tags": ["community-event", "expansion"],
  "difficulty": "late",
  "createdBy": "static"
}
```

#### Crisis Management
```json
{
  "id": "health-inspector-surprise",
  "title": "Surprise Health Inspection",
  "text": "A health inspector arrives during your busiest hour. Your truck is mostly clean, but there are a few minor issues that could be problems.",
  "choices": [
    {
      "id": "full-cooperation",
      "label": "Stop everything and give full cooperation",
      "effects": { "money": -20, "reputation": 8, "energy": -10 }
    },
    {
      "id": "quick-cleanup",
      "label": "Quickly address obvious issues first",
      "effects": { "reputation": -8, "energy": -15 }
    },
    {
      "id": "business-as-usual",
      "label": "Continue serving while being inspected", 
      "effects": { "money": 15, "reputation": -15, "energy": -8 }
    }
  ],
  "tags": ["permits", "crisis"],
  "difficulty": "late",
  "createdBy": "static"
}
```

## AI Generation Guidelines

### Prompt Templates for Each Category

#### Customer Service Prompts
```
Generate a customer service scenario for a food truck.
Context: [GAME_CONTEXT]
Requirements:
- Focus on interpersonal interaction
- Choices should balance customer satisfaction vs. business efficiency
- Effects should reflect service quality impact on reputation
- Keep scenario realistic and family-friendly
```

#### Equipment/Supply Prompts  
```
Generate an operational challenge scenario for a food truck.
Context: [GAME_CONTEXT]
Requirements:
- Focus on business operations (equipment, supplies, logistics)
- Choices should involve resource trade-offs
- Money effects should reflect operational costs
- Energy effects should reflect physical/mental effort required
```

#### External Event Prompts
```
Generate an external event scenario affecting a food truck business.
Context: [GAME_CONTEXT] 
Requirements:
- Focus on external factors (weather, permits, competition, community)
- Choices should involve strategic business decisions
- Effects should have lasting impact on business reputation
- Include both risk and opportunity elements
```

## Scenario Validation Checklist

### Content Requirements
- [ ] Family-friendly and workplace-appropriate
- [ ] Stays within food truck business theme
- [ ] Presents meaningful choice consequences
- [ ] Avoids extreme or unrealistic situations
- [ ] Maintains positive, solution-oriented tone

### Technical Requirements
- [ ] Valid JSON structure
- [ ] 2-4 choices per scenario
- [ ] Effects within bounds (-20 to +20)
- [ ] Appropriate difficulty level
- [ ] Correct tag categorization
- [ ] Unique scenario ID

### Quality Requirements
- [ ] Clear, engaging narrative (100-400 characters)
- [ ] Distinct choice outcomes
- [ ] Balanced risk/reward ratios
- [ ] Realistic business scenarios
- [ ] Educational value about business management

## Static Scenario Library Structure

```
scenarios/
├── early/
│   ├── customer-service/
│   │   ├── first-customer.json
│   │   ├── indecisive-customer.json
│   │   └── rush-hour-basics.json
│   ├── supply-management/
│   │   ├── ingredient-shortage.json
│   │   ├── vendor-delivery.json
│   │   └── menu-planning.json
│   └── equipment/
│       ├── setup-issues.json
│       └── basic-maintenance.json
├── mid/
│   ├── competition/
│   ├── permits/
│   ├── equipment/
│   └── community-events/
└── late/
    ├── expansion/
    ├── crisis/
    └── strategic/
```