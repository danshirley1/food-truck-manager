"use strict";
/**
 * Main game controller for CLI version
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodTruckGame = void 0;
exports.startGame = startGame;
const game_state_1 = require("../engine/game-state");
const scenario_loader_1 = require("../scenarios/scenario-loader");
const display_1 = require("./display");
const input_1 = require("./input");
class FoodTruckGame {
    constructor(sessionId, randomSeed) {
        this.gameState = game_state_1.GameStateManager.createNew(sessionId, randomSeed);
    }
    /**
     * Start and run the main game loop
     */
    async start() {
        input_1.Input.init();
        try {
            display_1.Display.clear();
            display_1.Display.showTitle();
            // Show instructions
            display_1.Display.showHelp();
            await input_1.Input.waitForKey('Press any key to start your food truck adventure');
            // Main game loop
            while (!this.gameState.gameOver) {
                await this.playTurn();
            }
            // Game over
            display_1.Display.showGameOver(this.gameState);
            // Ask if they want to play again
            const playAgain = await input_1.Input.askYesNo('Would you like to play again?');
            if (playAgain) {
                const newGame = new FoodTruckGame();
                await newGame.start();
            }
        }
        finally {
            input_1.Input.cleanup();
        }
    }
    /**
     * Play a single turn of the game
     */
    async playTurn() {
        // Clear screen and show status
        display_1.Display.clear();
        display_1.Display.showTitle();
        display_1.Display.showStatsBar(this.gameState);
        // Get scenario for current context
        const context = this.buildScenarioContext();
        const scenario = scenario_loader_1.ScenarioLoader.getScenario(context);
        if (!scenario) {
            display_1.Display.showError('No scenarios available! This shouldn\'t happen.');
            this.gameState.gameOver = true;
            return;
        }
        // Display scenario and get player choice
        display_1.Display.showScenario(scenario);
        const choiceIndex = await input_1.Input.askChoice(scenario.choices.length);
        const selectedChoice = scenario.choices[choiceIndex - 1];
        // Store resources before change for display
        const resourcesBefore = { ...this.gameState.resources };
        // Apply choice and update game state
        this.gameState = game_state_1.GameStateManager.applyChoice(this.gameState, scenario, selectedChoice);
        // Show results
        display_1.Display.showChoiceResult(selectedChoice, resourcesBefore, this.gameState.resources);
        // Show updated stats after the choice
        console.log(''); // Add some space
        display_1.Display.showStatsBar(this.gameState);
        // Check for game over
        if (this.gameState.gameOver) {
            await input_1.Input.waitForKey('Press any key to see final results');
        }
        else {
            await input_1.Input.waitForKey('Press any key to continue to the next day');
        }
    }
    /**
     * Build scenario context for current game state
     */
    buildScenarioContext() {
        const difficulty = game_state_1.GameStateManager.getCurrentDifficulty(this.gameState.turn + 1);
        // Get recent scenario tags from choice history
        const recentChoices = this.gameState.choiceHistory
            .slice(-3) // Last 3 choices
            .map(record => {
            // For now, we'll extract tags from scenario ID patterns
            // In a full implementation, we'd store scenario tags in choice records
            return this.extractTagFromScenarioId(record.scenarioId);
        })
            .filter(tag => tag !== null);
        return {
            currentResources: this.gameState.resources,
            turn: this.gameState.turn + 1,
            difficultyLevel: difficulty,
            recentChoices,
            availableTags: [
                'customer-service',
                'supply-management',
                'equipment',
                'permits',
                'competition',
                'weather',
                'community-event',
                'crisis',
                'expansion'
            ],
            randomSeed: this.gameState.randomSeed
        };
    }
    /**
     * Extract likely tag from scenario ID (simple heuristic)
     */
    extractTagFromScenarioId(scenarioId) {
        const tagMap = {
            'customer': 'customer-service',
            'permit': 'permits',
            'ingredient': 'supply-management',
            'equipment': 'equipment',
            'competitor': 'competition',
            'weather': 'weather',
            'expansion': 'expansion',
            'health': 'permits',
            'social': 'community-event'
        };
        for (const [keyword, tag] of Object.entries(tagMap)) {
            if (scenarioId.includes(keyword)) {
                return tag;
            }
        }
        return null;
    }
    /**
     * Get current game state (for debugging/testing)
     */
    getGameState() {
        return { ...this.gameState };
    }
    /**
     * Load a saved game state
     */
    loadGameState(gameState) {
        this.gameState = gameState;
    }
}
exports.FoodTruckGame = FoodTruckGame;
/**
 * Main entry point for the CLI game
 */
async function startGame() {
    const game = new FoodTruckGame();
    await game.start();
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Thanks for playing Food Truck Manager!');
    process.exit(0);
});
//# sourceMappingURL=game.js.map