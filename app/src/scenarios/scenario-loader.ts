/**
 * Scenario loading and selection logic
 */

import * as fs from 'fs';
import * as path from 'path';
import { Scenario, DifficultyLevel, ScenarioTag, ScenarioContext } from '../types';
import { ScenarioSchema } from '../types/validation';
import { randomChoice } from '../utils/helpers';

interface StaticScenarios {
  early: Scenario[];
  mid: Scenario[];
  late: Scenario[];
}

export class ScenarioLoader {
  private static staticScenarios: StaticScenarios | null = null;

  /**
   * Load static scenarios from JSON file
   */
  static loadStaticScenarios(): StaticScenarios {
    if (this.staticScenarios) {
      return this.staticScenarios;
    }

    try {
      const scenariosPath = path.join(__dirname, 'static-scenarios.json');
      const rawData = fs.readFileSync(scenariosPath, 'utf-8');
      const parsedData = JSON.parse(rawData);

      // Validate each scenario
      const validatedData: StaticScenarios = {
        early: [],
        mid: [],
        late: []
      };

      for (const difficulty of ['early', 'mid', 'late'] as DifficultyLevel[]) {
        const scenarios = parsedData[difficulty] || [];
        
        for (const scenario of scenarios) {
          try {
            // Add createdAt if not present
            if (!scenario.createdAt) {
              scenario.createdAt = new Date();
            }
            
            const validatedScenario = ScenarioSchema.parse(scenario);
            validatedData[difficulty].push(validatedScenario);
          } catch (error) {
            console.warn(`Invalid scenario ${scenario.id}:`, error);
          }
        }
      }

      this.staticScenarios = validatedData;
      return this.staticScenarios;
    } catch (error) {
      console.error('Failed to load static scenarios:', error);
      return { early: [], mid: [], late: [] };
    }
  }

  /**
   * Get a scenario appropriate for the current game context
   */
  static getScenario(context: ScenarioContext): Scenario | null {
    const staticScenarios = this.loadStaticScenarios();
    const availableScenarios = staticScenarios[context.difficultyLevel] || [];

    if (availableScenarios.length === 0) {
      return null;
    }

    // Filter scenarios to avoid recent repeats
    const recentTags = new Set(context.recentChoices);
    const preferredScenarios = availableScenarios.filter(scenario => {
      return !scenario.tags.some(tag => recentTags.has(tag));
    });

    // Use preferred scenarios if available, otherwise use any available
    const candidateScenarios = preferredScenarios.length > 0 
      ? preferredScenarios 
      : availableScenarios;

    return randomChoice(candidateScenarios);
  }

  /**
   * Get all scenarios for a specific difficulty level
   */
  static getScenariosByDifficulty(difficulty: DifficultyLevel): Scenario[] {
    const staticScenarios = this.loadStaticScenarios();
    return staticScenarios[difficulty] || [];
  }

  /**
   * Get scenarios by tag
   */
  static getScenariosByTag(tag: ScenarioTag): Scenario[] {
    const staticScenarios = this.loadStaticScenarios();
    const allScenarios = [
      ...staticScenarios.early,
      ...staticScenarios.mid,
      ...staticScenarios.late
    ];

    return allScenarios.filter(scenario => scenario.tags.includes(tag));
  }

  /**
   * Get scenario by ID
   */
  static getScenarioById(id: string): Scenario | null {
    const staticScenarios = this.loadStaticScenarios();
    const allScenarios = [
      ...staticScenarios.early,
      ...staticScenarios.mid,
      ...staticScenarios.late
    ];

    return allScenarios.find(scenario => scenario.id === id) || null;
  }

  /**
   * Get recent choice tags from game state for context
   */
  static getRecentChoiceTags(choiceHistory: any[], limit: number = 3): string[] {
    // This would need to be implemented based on how we track scenario tags
    // For now, return empty array
    return [];
  }

  /**
   * Validate a scenario object
   */
  static validateScenario(scenario: any): Scenario | null {
    try {
      return ScenarioSchema.parse(scenario);
    } catch (error) {
      console.warn('Scenario validation failed:', error);
      return null;
    }
  }
}