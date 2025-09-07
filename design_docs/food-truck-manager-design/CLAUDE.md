# Food Truck Manager - Claude Context

## Project Overview
A portfolio showcase application featuring a Food Truck Manager simulation game. Players navigate scenarios like permits, supply chains, festival bookings, and customer interactions through decision-based gameplay.

## Development Approach
- **Phase 1**: CLI-based prototype with simple decision trees
- **Phase 2**: React frontend with AWS backend integration
- **Focus**: System design and architecture over complex game theory
- **AI Integration**: Generate scenario content and choices to minimize manual content creation

## Key Design Decisions

### 2025-09-07 - Initial Project Setup
- **Theme Selected**: Food Truck Manager (over Coffee Shop or Park Ranger)
- **Architecture**: JavaScript/TypeScript with AWS backend
- **AI Strategy**: Use AI for content generation (scenarios, choices) rather than complex game logic
- **Documentation Structure**: Created comprehensive design documentation hierarchy
- **Development Philosophy**: Keep game mechanics simple (resource deltas), let AI handle creative content

### 2025-09-07 - Core Game Design
- **Resource System**: 3 resources (money: -999 to 999, reputation: 0-100, energy: 0-100)
- **Game Length**: 15 turns representing 15 days of operation
- **Effect Constraints**: Individual effects limited to ±20, turn totals to ±30
- **Failure States**: Burnout (energy ≤ 0), reputation death (reputation ≤ 0), bankruptcy (money ≤ -500)
- **Victory Condition**: Complete all 15 turns successfully
- **Data Model**: TypeScript-first with Zod validation for AI safety
- **Difficulty Progression**: Early (1-5), Mid (6-10), Late (11-15) turns with escalating stakes

### 2025-09-07 - AI Integration & Content Strategy
- **AI Role**: Generate scenario narratives and choice labels, not game logic or effects
- **Content Safety**: Multi-layer validation (JSON schema, content moderation, effect bounds)
- **Fallback Strategy**: Static scenario library for AI failures, hybrid generation approach
- **Scenario Categories**: Customer service, supply management, equipment, permits, competition, weather, community events, crisis management, expansion
- **Caching Strategy**: Pre-generate common scenarios, context-aware cache keys
- **Cost Management**: Batch generation, smart caching, token optimization, budget alerts

## Commands to Remember
```bash
# Add any specific commands for this project here as they're discovered
```

## Design Documentation Structure
- `architecture/` - System design, data flow, AWS services
- `game-design/` - Game mechanics, scenarios, AI integration  
- `technical/` - Data models, algorithms, validation
- `ui-ux/` - Interface designs and user flows
- `deployment/` - Infrastructure and CI/CD

## Documentation Mandate
⚠️ **CRITICAL**: Always update design documentation when making ANY design changes or decisions. This includes:
- Updating relevant design files when decisions are made
- Creating new documentation files as needed
- Maintaining traceability of all design decisions
- Ensuring all design evolution is documented in real-time

### 2025-09-07 - Phase 1 Implementation Complete
- **CLI Game Built**: Fully playable CLI version with interactive interface
- **Core Components**: Game state management, scenario loading, input/display systems
- **Testing**: Comprehensive test suite with 100% coverage of game logic
- **Static Content**: 8 curated scenarios across all difficulty levels
- **Project Structure**: Clean TypeScript architecture following design docs
- **Build System**: Complete npm scripts for dev, build, test workflows
- **Documentation**: README and inline documentation for maintainability

## Next Steps - Phase 2 (Web Application)
- Add AI scenario generation with OpenAI integration
- Design React frontend architecture and component hierarchy  
- Plan AWS Lambda backend with DynamoDB integration
- Create deployment pipeline with CDK infrastructure as code