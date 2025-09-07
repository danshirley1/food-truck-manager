/**
 * CLI display utilities for Food Truck Manager
 */
import { GameState, Scenario, Choice, Resources } from '../types';
export declare class Display {
    /**
     * Clear the console screen
     */
    static clear(): void;
    /**
     * Format money with appropriate colors
     */
    private static formatMoney;
    /**
     * Format reputation with appropriate colors
     */
    private static formatReputation;
    /**
     * Format energy with appropriate colors
     */
    private static formatEnergy;
    /**
     * Show compact stats bar (always visible)
     */
    static showStatsBar(gameState: GameState): void;
    /**
     * Display game title and branding
     */
    static showTitle(): void;
    /**
     * Display current game status
     */
    static showGameStatus(gameState: GameState): void;
    /**
     * Display a scenario with choices
     */
    static showScenario(scenario: Scenario): void;
    /**
     * Format resource effects for display
     */
    private static formatEffects;
    /**
     * Show choice result
     */
    static showChoiceResult(choice: Choice, resourcesBefore: Resources, resourcesAfter: Resources): void;
    /**
     * Display game over screen
     */
    static showGameOver(gameState: GameState): void;
    /**
     * Display help information
     */
    static showHelp(): void;
    /**
     * Prompt for user input
     */
    static prompt(message: string): void;
    /**
     * Display error message
     */
    static showError(message: string): void;
    /**
     * Display loading message
     */
    static showLoading(message: string): void;
    /**
     * Wait for user to press Enter
     */
    static waitForEnter(): Promise<void>;
}
//# sourceMappingURL=display.d.ts.map