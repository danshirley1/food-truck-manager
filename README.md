# 🚚 Food Truck Manager

A portfolio showcase application featuring a business simulation game playable in both CLI and web formats.

## 🚀 Quick Start (Local Development)

### Prerequisites
```bash
# Use the specified Node.js version
nvm use    # Reads .nvmrc (Node.js 22.19.0 LTS)

# OR install if not available
nvm install
```

### One Command Development Setup
```bash
yarn dev
```
This will start:
- 📦 **Shared module** watching for changes
- 🌐 **Web app** at http://localhost:3000
- 📋 **Development info** display

### CLI Game (Separate Terminal)
```bash
yarn dev:cli
```

## 📁 Project Structure

```
├── cli/          # CLI version (Node.js + TypeScript)
├── web/          # Web version (Next.js + React)
├── shared/       # Common game logic (TypeScript)
└── package.json  # Development orchestration
```

## 🛠️ Available Scripts

### Development
- `yarn dev` - Start web + shared development servers with info
- `yarn dev:cli` - Start CLI game (interactive terminal)
- `yarn dev:web` - Start web development server only
- `yarn dev:shared` - Start shared module watcher only

### Building
- `yarn build` - Build all projects
- `yarn build:web` - Build web version
- `yarn build:cli` - Build CLI version
- `yarn build:shared` - Build shared module

### Setup & Maintenance
- `yarn install:all` - Install all dependencies
- `yarn clean` - Clean all build artifacts and node_modules
- `yarn test` - Run CLI tests
- `yarn test:watch` - Run CLI tests in watch mode

## 🎮 How to Play

### Web Version
1. Run `yarn dev`
2. Open http://localhost:3000 in your browser
3. Click "Start Your Food Truck Adventure"

### CLI Version
1. Run `yarn dev:cli` in a separate terminal
2. Follow the interactive prompts
3. Make choices using number keys

## 🎯 Game Rules

Manage your food truck for 15 days by balancing three resources:

- **💰 Money (-999 to +999)**: Your financial health
- **⭐ Reputation (0-100%)**: Customer satisfaction
- **⚡ Energy (0-100%)**: Your physical and mental capacity

**Win**: Complete all 15 days successfully
**Lose**: Run out of energy (≤0), reputation (≤0), or money (≤-500)

## 🏗️ Architecture

The project demonstrates modern software engineering with shared business logic:

```
┌─────────────┐    ┌─────────────┐
│     CLI     │    │     Web     │
│  Terminal   │    │   Browser   │
│   Yarn      │    │     NPM     │
└─────────────┘    └─────────────┘
       │                   │
       └───────┬───────────┘
               │
         ┌─────────────┐
         │   Shared    │
         │ Game Logic  │
         │ TypeScript  │
         └─────────────┘
```

## 📚 Documentation

- **Design Docs**: `design_docs/food-truck-manager-design/`
- **CLI README**: `cli/README.md`
- **Web README**: `web/README.md`

---

**Built with ❤️ as a portfolio showcase project**