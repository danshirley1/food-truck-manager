# Food Truck Manager - High Level Architecture

## System Overview
A two-phase portfolio application demonstrating full-stack development with AI integration:

**Phase 1**: CLI-based prototype for rapid iteration and core mechanics validation
**Phase 2**: React frontend with AWS serverless backend

## Architecture Principles
- **AI-First Content**: Minimize manual content creation, maximize AI-generated scenarios
- **Simple Game Logic**: Focus on technical architecture over complex game mechanics
- **Portfolio Showcase**: Demonstrate modern development practices and AWS integration
- **Scalable Design**: Architecture should support growth from CLI to full web application

## High-Level Components

### Phase 1: CLI Application
```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│   CLI Client    │────│ Game Engine  │────│ AI Service  │
│                 │    │              │    │ (OpenAI)    │
│ - User Input    │    │ - Game State │    │             │
│ - Display       │    │ - Rules      │    └─────────────┘
│ - Validation    │    │ - Scoring    │
└─────────────────┘    └──────────────┘
```

### Phase 2: Web Application
```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│ React SPA   │────│ API Gateway  │────│ Lambda Functions│
│             │    │              │    │                 │
│ - Game UI   │    │ - Routing    │    │ - Game Logic    │
│ - State Mgmt│    │ - Auth       │    │ - AI Integration│
│ - Components│    │ - CORS       │    │ - Validation    │
└─────────────┘    └──────────────┘    └─────────────────┘
                                                │
                                       ┌─────────────────┐
                                       │   DynamoDB      │
                                       │                 │
                                       │ - Game Sessions │
                                       │ - Player State  │
                                       │ - Scenarios     │
                                       └─────────────────┘
```

## Technology Stack

### Phase 1 (CLI)
- **Runtime**: Node.js
- **Language**: TypeScript
- **AI Integration**: OpenAI API
- **Validation**: Zod
- **Testing**: Jest

### Phase 2 (Web)
- **Frontend**: React + TypeScript, Vite
- **Backend**: AWS Lambda (Node.js 20)
- **Database**: DynamoDB
- **API**: API Gateway REST API
- **AI**: OpenAI API → migrate to AWS Bedrock
- **Infrastructure**: AWS CDK
- **Hosting**: S3 + CloudFront

## Core Data Flow

### Game Session Flow
1. **Initialize**: Create game state with starting resources
2. **Generate Scenario**: AI creates situation with choices
3. **Present**: Display scenario and choices to player
4. **Choose**: Player selects option
5. **Apply Effects**: Update resources based on choice
6. **Check End Conditions**: Game over or continue
7. **Repeat**: Generate next scenario or end game

### AI Integration Points
- **Scenario Generation**: AI creates contextual scenarios based on game state
- **Choice Variation**: AI generates different options for similar situations
- **Narrative Consistency**: AI maintains thematic coherence across scenarios

## Design Constraints
- **Content Safety**: All AI-generated content must be SFW and portfolio-appropriate
- **Resource Bounds**: Game effects limited to prevent extreme swings
- **Deterministic Core**: Game rules are predictable, only content is AI-generated
- **State Simplicity**: Minimal game state for easy serialization and debugging

## Success Metrics
- **Technical**: Demonstrates AWS serverless patterns, TypeScript proficiency, AI integration
- **Portfolio Value**: Shows progression from CLI to web, modern development practices
- **Playability**: Engaging enough to showcase for 5-10 minutes during interviews