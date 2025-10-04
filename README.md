# 🚚 Food Truck Manager

A portfolio showcase application featuring a business simulation game built with Next.js and React.

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
This will start the Next.js development server at http://localhost:3000

## 📁 Project Structure

```
web/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Game logic and utilities
│       ├── engine/   # Game state management
│       ├── types/    # TypeScript types
│       ├── scenarios/# Scenario loader
│       └── game/     # Main game exports
└── package.json
```

## 🛠️ Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run linter
- `yarn clean` - Clean build artifacts

## 🎮 How to Play

1. Run `yarn dev`
2. Open http://localhost:3000 in your browser
3. Click "Start Your Food Truck Adventure"
4. Make decisions to manage your resources over 15 days

## 🎯 Game Rules

Manage your food truck for 15 days by balancing three resources:

- **💰 Money (-999 to +999)**: Your financial health
- **⭐ Reputation (0-100%)**: Customer satisfaction
- **⚡ Energy (0-100%)**: Your physical and mental capacity

**Win**: Complete all 15 days successfully
**Lose**: Run out of energy (≤0), reputation (≤0), or money (≤-500)

## 🏗️ Architecture

Single Next.js application with modular game logic:

```
Next.js App (TypeScript + React)
├── UI Layer (Components)
├── Business Logic (Hooks)
└── Game Engine (Lib)
    ├── State Management
    ├── Type Definitions
    └── Scenario System
```

**Tech Stack:**
- Next.js 14 with App Router
- React with TypeScript
- Tailwind CSS + shadcn/ui
- Zod for validation

## 📚 Documentation

- **Design Docs**: `design_docs/food-truck-manager-design/`
- **Web README**: `web/README.md`

---

**Built with ❤️ as a portfolio showcase project**