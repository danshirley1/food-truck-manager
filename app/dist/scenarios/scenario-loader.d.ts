/**
 * Scenario loading and selection logic
 */
import { Scenario, DifficultyLevel, ScenarioTag, ScenarioContext } from '../types';
interface StaticScenarios {
    early: Scenario[];
    mid: Scenario[];
    late: Scenario[];
}
export declare class ScenarioLoader {
    private static staticScenarios;
    /**
     * Load static scenarios from JSON file
     */
    static loadStaticScenarios(): StaticScenarios;
    /**
     * Get a scenario appropriate for the current game context
     */
    static getScenario(context: ScenarioContext): Scenario | null;
    /**
     * Get all scenarios for a specific difficulty level
     */
    static getScenariosByDifficulty(difficulty: DifficultyLevel): Scenario[];
    /**
     * Get scenarios by tag
     */
    static getScenariosByTag(tag: ScenarioTag): Scenario[];
    /**
     * Get scenario by ID
     */
    static getScenarioById(id: string): Scenario | null;
    /**
     * Get recent choice tags from game state for context
     */
    static getRecentChoiceTags(choiceHistory: any[], limit?: number): string[];
    /**
     * Validate a scenario object
     */
    static validateScenario(scenario: any): Scenario | null;
}
export {};
//# sourceMappingURL=scenario-loader.d.ts.map