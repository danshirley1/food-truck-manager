/**
 * Main game controller for CLI version
 */

import { GameState, Scenario, Choice, ScenarioContext } from '../types';
import { GameStateManager } from '../engine/game-state';
import { ScenarioLoader } from '../scenarios/scenario-loader';
import { Display } from './display';
import { Input } from './input';

export class FoodTruckGame {
  private gameState: GameState;

  constructor(sessionId?: string, randomSeed?: string) {
    this.gameState = GameStateManager.createNew(sessionId, randomSeed);
  }

  /**
   * Start and run the main game loop
   */
  async start(): Promise<void> {
    Input.init();

    try {
      Display.clear();
      Display.showTitle();
      
      // Show instructions
      Display.showHelp();
      await Input.waitForKey('Press any key to start your food truck adventure');

      // Main game loop
      while (!this.gameState.gameOver) {
        await this.playTurn();
      }

      // Game over
      Display.showGameOver(this.gameState);
      
      // Ask if they want to play again
      const playAgain = await Input.askYesNo('Would you like to play again?');
      if (playAgain) {
        const newGame = new FoodTruckGame();
        await newGame.start();
      }

    } finally {
      Input.cleanup();
    }
  }

  /**
   * Play a single turn of the game
   */
  private async playTurn(): Promise<void> {
    // Clear screen and show status
    Display.clear();
    Display.showTitle();
    Display.showStatsBar(this.gameState);

    // Get scenario for current context
    const context = this.buildScenarioContext();
    const scenario = ScenarioLoader.getScenario(context);

    if (!scenario) {
      Display.showError('No scenarios available! This shouldn\'t happen.');
      this.gameState.gameOver = true;
      return;
    }

    // Display scenario and get player choice
    Display.showScenario(scenario);
    
    const choiceIndex = await Input.askChoice(scenario.choices.length);
    const selectedChoice = scenario.choices[choiceIndex - 1];

    // Store resources before change for display
    const resourcesBefore = { ...this.gameState.resources };

    // Apply choice and update game state
    this.gameState = GameStateManager.applyChoice(
      this.gameState,
      scenario,
      selectedChoice
    );

    // Show results
    Display.showChoiceResult(selectedChoice, resourcesBefore, this.gameState.resources);
    
    // Show updated stats after the choice
    console.log(''); // Add some space
    Display.showStatsBar(this.gameState);

    // Check for game over
    if (this.gameState.gameOver) {
      await Input.waitForKey('Press any key to see final results');
    } else {
      await Input.waitForKey('Press any key to continue to the next day');
    }
  }

  /**
   * Build scenario context for current game state
   */
  private buildScenarioContext(): ScenarioContext {
    const difficulty = GameStateManager.getCurrentDifficulty(this.gameState.turn + 1);
    
    // Get recent scenario tags from choice history
    const recentChoices = this.gameState.choiceHistory
      .slice(-3)  // Last 3 choices
      .map(record => {
        // For now, we'll extract tags from scenario ID patterns
        // In a full implementation, we'd store scenario tags in choice records
        return this.extractTagFromScenarioId(record.scenarioId);
      })
      .filter(tag => tag !== null) as string[];

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
  private extractTagFromScenarioId(scenarioId: string): string | null {
    const tagMap: Record<string, string> = {
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
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Load a saved game state
   */
  loadGameState(gameState: GameState): void {
    this.gameState = gameState;
  }
}

/**
 * Main entry point for the CLI game
 */
export async function startGame(): Promise<void> {
  const game = new FoodTruckGame();
  await game.start();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Thanks for playing Food Truck Manager!');
  process.exit(0);
});