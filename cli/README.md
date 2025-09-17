# 🚚 Food Truck Manager

A portfolio showcase application featuring a text-based business simulation game. Manage your food truck through 15 days of operation, making strategic decisions that affect your money, reputation, and energy.

## 🎯 Project Goals

This project demonstrates:
- **Modern TypeScript Development**: Strong typing with Zod validation
- **Game Design**: Simple but engaging mechanics with AI content generation
- **CLI Development**: Interactive command-line interface
- **Testing**: Comprehensive test coverage for core logic
- **Documentation**: Clear design documentation and decision tracking

## 🎮 How to Play

Navigate scenarios by making choices that affect three core resources:

- **💰 Money (-999 to +999)**: Your financial health
- **⭐ Reputation (0-100%)**: Customer satisfaction and word-of-mouth
- **⚡ Energy (0-100%)**: Your physical and mental capacity

**Win Condition**: Survive all 15 days without running out of any resource.

**Failure Conditions**: 
- Energy ≤ 0 (Burnout)
- Reputation ≤ 0 (Reputation Death)  
- Money ≤ -500 (Bankruptcy)

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Run the CLI game
yarn dev

# Build the project
yarn build

# Run tests
yarn test
```

## 📁 Project Structure

```
src/
├── types/           # TypeScript types and Zod schemas
├── engine/          # Core game logic and state management
├── scenarios/       # Static scenario content and loading
├── cli/             # Command-line interface
└── utils/           # Helper functions and utilities

test/               # Test files
design_docs/        # Comprehensive design documentation
```

## 🧪 Game Features

### Phase 1: CLI Prototype ✅
- [x] Complete game mechanics with 3-resource system
- [x] 15 turn gameplay with difficulty progression
- [x] Static scenario library with varied content
- [x] Interactive CLI with rich display formatting
- [x] Comprehensive test coverage
- [x] TypeScript with strict validation

### Phase 2: Web Application (Planned)
- [ ] React frontend with modern UI
- [ ] AWS Lambda backend
- [ ] DynamoDB for session persistence
- [ ] AI-generated scenarios via OpenAI/Bedrock
- [ ] User accounts and leaderboards

## 🎨 Design Philosophy

**Simple Game Logic + Rich Content**: The core mechanics are intentionally simple (resource deltas with bounds checking) to focus on technical architecture rather than complex game theory. Content variety comes from AI generation and curated scenarios.

**AI-First Content Strategy**: Minimize manual content creation by using AI to generate scenario narratives while keeping game effects bounded and validated.

**Portfolio-Friendly**: Every technical decision demonstrates modern development practices suitable for showcasing in interviews and professional contexts.

## 🧰 Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript with strict compilation
- **Validation**: Zod schemas for type safety
- **Testing**: Jest with comprehensive coverage
- **CLI**: Native Node.js readline for interaction
- **Future**: React + AWS serverless architecture

## 📚 Documentation

Comprehensive design documentation available in `design_docs/`:
- System architecture and component design
- Game mechanics and balancing decisions  
- AI integration strategy and safety measures
- Data models and validation schemas
- Deployment and infrastructure planning

## 🧪 Testing

```bash
yarn test              # Run all tests
yarn test:watch        # Watch mode for development
```

Core game logic has 100% test coverage including:
- Resource management and bounds checking
- Game state transitions and end conditions
- Difficulty progression and scenario selection
- Edge cases and error conditions

## 🎯 Development Roadmap

1. **✅ CLI Prototype**: Complete playable text-based game
2. **🔄 AI Integration**: Replace static scenarios with AI generation
3. **📱 Web Frontend**: React SPA with modern UI
4. **☁️ AWS Backend**: Serverless architecture with DynamoDB
5. **🚀 Production**: Full deployment with monitoring and analytics

## 📝 Design Documentation

All major design decisions are tracked in `design_docs/food-truck-manager-design/CLAUDE.md` with full traceability of architectural choices and trade-offs.

---

**Built with ❤️ as a portfolio showcase project**