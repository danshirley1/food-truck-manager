/**
 * Main game controller for CLI version
 */
import { GameState } from '../types';
export declare class FoodTruckGame {
    private gameState;
    constructor(sessionId?: string, randomSeed?: string);
    /**
     * Start and run the main game loop
     */
    start(): Promise<void>;
    /**
     * Play a single turn of the game
     */
    private playTurn;
    /**
     * Build scenario context for current game state
     */
    private buildScenarioContext;
    /**
     * Extract likely tag from scenario ID (simple heuristic)
     */
    private extractTagFromScenarioId;
    /**
     * Get current game state (for debugging/testing)
     */
    getGameState(): GameState;
    /**
     * Load a saved game state
     */
    loadGameState(gameState: GameState): void;
}
/**
 * Main entry point for the CLI game
 */
export declare function startGame(): Promise<void>;
//# sourceMappingURL=game.d.ts.map