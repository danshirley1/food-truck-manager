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
This will start:
- 📦 **Shared module** watching for changes
- 🌐 **Web app** at http://localhost:3000

## 📁 Project Structure

```
├── web/          # Next.js web application (TypeScript + React)
├── shared/       # Common game logic (TypeScript)
└── package.json  # Yarn workspace orchestration
```

## 🛠️ Available Scripts

### Development
- `yarn dev` - Start web + shared development servers
- `yarn dev:web` - Start web development server only
- `yarn dev:shared` - Start shared module watcher only

### Building
- `yarn build` - Build all projects
- `yarn build:web` - Build web version
- `yarn build:shared` - Build shared module

### Setup & Maintenance
- `yarn install:all` - Install all dependencies
- `yarn clean` - Clean all build artifacts and node_modules
- `yarn lint` - Run linter on web application
- `yarn start` - Start production web server

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

Modern full-stack web application with modular architecture:

```
┌─────────────────┐
│   Next.js Web   │
│   Application   │
│   (TypeScript)  │
└────────┬────────┘
         │
         │ imports
         │
  ┌──────▼──────┐
  │   Shared    │
  │ Game Logic  │
  │ TypeScript  │
  └─────────────┘
```

**Tech Stack:**
- Next.js 14 with App Router
- React with TypeScript
- Tailwind CSS for styling
- Yarn workspaces for monorepo management

## 📚 Documentation

- **Design Docs**: `design_docs/food-truck-manager-design/`
- **Web README**: `web/README.md`

---

**Built with ❤️ as a portfolio showcase project**