'use client';

import { useState, useCallback } from 'react';
import {
  GameState,
  GameStateManager,
  Scenario,
  Choice,
  ScenarioContext,
} from '@/lib/game';
import { ApiScenarioLoader } from '@/lib/scenarios/api-scenario-loader';

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(() =>
    GameStateManager.createNew()
  );
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const buildScenarioContext = useCallback((state: GameState): ScenarioContext => {
    const difficulty = GameStateManager.getCurrentDifficulty(state.turn + 1);

    const recentChoices = state.choiceHistory
      .slice(-3)
      .map((record) => {
        const scenarioId = record.scenarioId.toLowerCase();
        if (scenarioId.includes('customer')) return 'customer-service';
        if (scenarioId.includes('permit')) return 'permits';
        if (scenarioId.includes('ingredient') || scenarioId.includes('supply'))
          return 'supply-management';
        if (scenarioId.includes('equipment') || scenarioId.includes('grill'))
          return 'equipment';
        if (scenarioId.includes('competitor')) return 'competition';
        if (scenarioId.includes('weather') || scenarioId.includes('storm'))
          return 'weather';
        if (scenarioId.includes('social') || scenarioId.includes('viral'))
          return 'community-event';
        if (scenarioId.includes('expansion')) return 'expansion';
        return null;
      })
      .filter(Boolean) as string[];

    const recentScenarioIds = state.choiceHistory
      .slice(-5)
      .map((record) => record.scenarioId);

    return {
      currentResources: state.resources,
      turn: state.turn + 1,
      difficultyLevel: difficulty,
      recentChoices,
      recentScenarioIds,
      availableTags: [
        'customer-service',
        'supply-management',
        'equipment',
        'permits',
        'competition',
        'weather',
        'community-event',
        'crisis',
        'expansion',
      ],
      randomSeed: state.randomSeed,
    };
  }, []);

  const fetchScenario = useCallback(
    async (state: GameState): Promise<Scenario | null> => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const context = buildScenarioContext(state);
        const scenario = await ApiScenarioLoader.getScenario(context);
        setCurrentScenario(scenario);
        return scenario;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load scenario';
        console.error('Failed to load scenario:', message);
        setLoadError(message);
        setCurrentScenario(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [buildScenarioContext]
  );

  const loadNextScenario = useCallback(async () => {
    await fetchScenario(gameState);
  }, [gameState, fetchScenario]);

  const makeChoice = useCallback(
    async (choice: Choice) => {
      if (!currentScenario) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        const newGameState = GameStateManager.applyChoice(
          gameState,
          currentScenario,
          choice
        );

        setGameState(newGameState);

        if (!newGameState.gameOver) {
          setTimeout(() => {
            void fetchScenario(newGameState);
          }, 1000);
        } else {
          setCurrentScenario(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to apply choice:', error);
        setIsLoading(false);
      }
    },
    [gameState, currentScenario, fetchScenario]
  );

  const startNewGame = useCallback(async () => {
    const newGameState = GameStateManager.createNew();
    setGameState(newGameState);
    await fetchScenario(newGameState);
  }, [fetchScenario]);

  const restartGame = useCallback(async () => {
    const newGameState = GameStateManager.createNew();
    setGameState(newGameState);
    await fetchScenario(newGameState);
  }, [fetchScenario]);

  const retryLoadScenario = useCallback(async () => {
    await fetchScenario(gameState);
  }, [gameState, fetchScenario]);

  return {
    gameState,
    currentScenario,
    isLoading,
    loadError,
    makeChoice,
    startNewGame,
    restartGame,
    loadNextScenario,
    retryLoadScenario,
  };
}
