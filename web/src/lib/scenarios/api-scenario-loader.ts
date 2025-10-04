/**
 * API-based Scenario Loader for Food Truck Manager
 *
 * LEARNING NOTES:
 * - This replaces WebScenarioLoader which had hardcoded data
 * - Instead of reading from a local array, we fetch from our API endpoint
 * - This runs in the BROWSER (client-side)
 * - Uses the native fetch() API to call our Next.js API routes
 */

import { Scenario, DifficultyLevel, ScenarioContext } from '../types';

/**
 * Response type from our API
 * This matches what we return from /api/scenarios/route.ts
 */
interface ScenariosApiResponse {
  success: boolean;
  count: number;
  scenarios: Scenario[];
}

/**
 * API-based scenario loader
 * Fetches scenarios from the Next.js API instead of using hardcoded data
 */
export class ApiScenarioLoader {
  // Cache scenarios in memory to avoid repeated API calls
  private static scenariosCache: Scenario[] | null = null;
  private static cacheTimestamp: number = 0;
  private static CACHE_DURATION = 60000; // 1 minute in milliseconds

  /**
   * Fetch all scenarios from the API
   * Uses caching to avoid unnecessary network requests
   */
  static async fetchAllScenarios(): Promise<Scenario[]> {
    // Check if cache is still valid
    const now = Date.now();
    if (
      this.scenariosCache &&
      now - this.cacheTimestamp < this.CACHE_DURATION
    ) {
      console.log('[ApiScenarioLoader] Using cached scenarios');
      return this.scenariosCache;
    }

    try {
      console.log('[ApiScenarioLoader] Fetching scenarios from API...');

      // Call our API endpoint
      // In Next.js, relative URLs like /api/scenarios work because
      // they're on the same domain
      const response = await fetch('/api/scenarios');

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data: ScenariosApiResponse = await response.json();

      if (!data.success) {
        throw new Error('API returned success: false');
      }

      // Convert createdAt strings back to Date objects
      const scenarios = data.scenarios.map(scenario => ({
        ...scenario,
        createdAt: new Date(scenario.createdAt)
      }));

      // Update cache
      this.scenariosCache = scenarios;
      this.cacheTimestamp = now;

      console.log(`[ApiScenarioLoader] Fetched ${scenarios.length} scenarios`);
      return scenarios;
    } catch (error) {
      console.error('[ApiScenarioLoader] Error fetching scenarios:', error);
      throw error;
    }
  }

  /**
   * Get a random scenario based on context
   * This is the main method used by the game
   */
  static async getScenario(context: ScenarioContext): Promise<Scenario | null> {
    try {
      // Fetch all scenarios (will use cache if available)
      const allScenarios = await this.fetchAllScenarios();

      console.log('[ApiScenarioLoader] Context:', context);
      console.log('[ApiScenarioLoader] Total scenarios:', allScenarios.length);

      // Filter scenarios by context
      const availableScenarios = this.filterScenariosByContext(allScenarios, context);
      console.log('[ApiScenarioLoader] Filtered scenarios:', availableScenarios.length);

      if (availableScenarios.length === 0) {
        console.warn('[ApiScenarioLoader] No scenarios available for context:', context);
        return null;
      }

      // Random selection
      const randomIndex = Math.floor(Math.random() * availableScenarios.length);
      return availableScenarios[randomIndex];
    } catch (error) {
      console.error('[ApiScenarioLoader] Error loading scenario:', error);
      return null;
    }
  }

  /**
   * Filter scenarios by context
   * Same logic as WebScenarioLoader
   */
  private static filterScenariosByContext(
    scenarios: Scenario[],
    context: ScenarioContext
  ): Scenario[] {
    // Filter by difficulty level
    const filtered = scenarios.filter(scenario => {
      return scenario.difficulty === context.difficultyLevel;
    });

    // Try to avoid recent repeats
    if (context.recentChoices.length > 0) {
      const nonRecentScenarios = filtered.filter(scenario => {
        const hasRecentTag = scenario.tags.some(tag =>
          context.recentChoices.includes(tag)
        );
        return !hasRecentTag;
      });

      // Only apply filtering if we still have scenarios left
      if (nonRecentScenarios.length > 0) {
        return nonRecentScenarios;
      }
    }

    return filtered;
  }

  /**
   * Get scenarios by difficulty
   * Useful for debugging or analytics
   */
  static async getScenariosByDifficulty(difficulty: DifficultyLevel): Promise<Scenario[]> {
    const allScenarios = await this.fetchAllScenarios();
    return allScenarios.filter(s => s.difficulty === difficulty);
  }

  /**
   * Clear the cache
   * Useful if you want to force a refresh from the API
   */
  static clearCache(): void {
    this.scenariosCache = null;
    this.cacheTimestamp = 0;
    console.log('[ApiScenarioLoader] Cache cleared');
  }
}
