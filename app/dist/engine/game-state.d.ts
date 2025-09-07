/**
 * Game state management for Food Truck Manager
 */
import { GameState, Choice, Scenario } from '../types';
export declare class GameStateManager {
    /**
     * Create a new game state with initial values
     */
    static createNew(sessionId?: string, randomSeed?: string): GameState;
    /**
     * Apply a player choice to the game state
     */
    static applyChoice(gameState: GameState, scenario: Scenario, choice: Choice): GameState;
    /**
     * Check if game should end based on current state
     */
    private static checkEndConditions;
    /**
     * Calculate final score based on resources and performance
     */
    private static calculateScore;
    /**
     * Get current difficulty level based on turn number
     */
    static getCurrentDifficulty(turn: number): 'early' | 'mid' | 'late';
    /**
     * Get formatted game status for display
     */
    static getGameStatus(gameState: GameState): string;
    /**
     * Validate that a choice is valid for the given scenario
     */
    static isValidChoice(scenario: Scenario, choiceId: string): boolean;
}
//# sourceMappingURL=game-state.d.ts.map