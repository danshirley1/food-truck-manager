'use client';

import { useState, useCallback } from 'react';
import {
  GameState,
  GameStateManager,
  Scenario,
  Choice,
  ScenarioContext
} from '@/lib/game';
import { ApiScenarioLoader } from '@/lib/scenarios/api-scenario-loader';

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(() =>
    GameStateManager.createNew()
  );
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const buildScenarioContext = useCallback((state: GameState): ScenarioContext => {
    const difficulty = GameStateManager.getCurrentDifficulty(state.turn + 1);

    // Simple scenario tag extraction from recent choices
    const recentChoices = state.choiceHistory
      .slice(-3)
      .map(record => {
        const scenarioId = record.scenarioId.toLowerCase();
        if (scenarioId.includes('customer')) return 'customer-service';
        if (scenarioId.includes('permit')) return 'permits';
        if (scenarioId.includes('ingredient')) return 'supply-management';
        if (scenarioId.includes('equipment')) return 'equipment';
        if (scenarioId.includes('competitor')) return 'competition';
        return null;
      })
      .filter(Boolean) as string[];

    return {
      currentResources: state.resources,
      turn: state.turn + 1,
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
      randomSeed: state.randomSeed
    };
  }, []);

  const loadNextScenario = useCallback(async () => {
    setIsLoading(true);

    try {
      const context = buildScenarioContext(gameState);
      // API call is async - we await the result
      const scenario = await ApiScenarioLoader.getScenario(context);
      setCurrentScenario(scenario);
    } catch (error) {
      console.error('Failed to load scenario:', error);
      setCurrentScenario(null);
    } finally {
      setIsLoading(false);
    }
  }, [gameState, buildScenarioContext]);

  const makeChoice = useCallback(async (choice: Choice) => {
    if (!currentScenario) return;

    setIsLoading(true);

    try {
      const newGameState = GameStateManager.applyChoice(
        gameState,
        currentScenario,
        choice
      );

      setGameState(newGameState);

      // If game isn't over, load next scenario
      if (!newGameState.gameOver) {
        // Small delay to show choice results
        setTimeout(async () => {
          const context = buildScenarioContext(newGameState);
          // API call is async - we await the result
          const nextScenario = await ApiScenarioLoader.getScenario(context);
          setCurrentScenario(nextScenario);
          setIsLoading(false);
        }, 1000);
      } else {
        setCurrentScenario(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to apply choice:', error);
      setIsLoading(false);
    }
  }, [gameState, currentScenario, buildScenarioContext]);

  const startNewGame = useCallback(async () => {
    const newGameState = GameStateManager.createNew();
    setGameState(newGameState);
    setIsLoading(true);

    // Load first scenario
    const context = buildScenarioContext(newGameState);
    // API call is async - we await the result
    const firstScenario = await ApiScenarioLoader.getScenario(context);
    setCurrentScenario(firstScenario);
    setIsLoading(false);
  }, [buildScenarioContext]);

  const restartGame = useCallback(async () => {
    const newGameState = GameStateManager.createNew();
    setGameState(newGameState);
    setIsLoading(true);

    // Load first scenario immediately without showing splash screen
    const context = buildScenarioContext(newGameState);
    // API call is async - we await the result
    const firstScenario = await ApiScenarioLoader.getScenario(context);
    setCurrentScenario(firstScenario);
    setIsLoading(false);
  }, [buildScenarioContext]);

  return {
    gameState,
    currentScenario,
    isLoading,
    makeChoice,
    startNewGame,
    restartGame,
    loadNextScenario
  };
}