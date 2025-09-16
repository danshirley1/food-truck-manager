'use client';

import { useState, useCallback } from 'react';
import {
  GameState,
  GameStateManager,
  Scenario,
  Choice,
  ScenarioContext
} from '@/lib/shared';
import { WebScenarioLoader } from '@/lib/shared/scenarios/web-scenario-loader';

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

  const loadNextScenario = useCallback(() => {
    setIsLoading(true);

    try {
      const context = buildScenarioContext(gameState);
      const scenario = WebScenarioLoader.getScenario(context);
      setCurrentScenario(scenario);
    } catch (error) {
      console.error('Failed to load scenario:', error);
      setCurrentScenario(null);
    } finally {
      setIsLoading(false);
    }
  }, [gameState, buildScenarioContext]);

  const makeChoice = useCallback((choice: Choice) => {
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
        setTimeout(() => {
          const context = buildScenarioContext(newGameState);
          const nextScenario = WebScenarioLoader.getScenario(context);
          setCurrentScenario(nextScenario);
          setIsLoading(false);
        }, 1000); // Small delay to show choice results
      } else {
        setCurrentScenario(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to apply choice:', error);
      setIsLoading(false);
    }
  }, [gameState, currentScenario, buildScenarioContext]);

  const startNewGame = useCallback(() => {
    const newGameState = GameStateManager.createNew();
    setGameState(newGameState);
    setCurrentScenario(null);
    setIsLoading(false);

    // Load first scenario
    setTimeout(() => {
      const context = buildScenarioContext(newGameState);
      const firstScenario = WebScenarioLoader.getScenario(context);
      setCurrentScenario(firstScenario);
    }, 100);
  }, [buildScenarioContext]);

  const restartGame = useCallback(() => {
    startNewGame();
  }, [startNewGame]);

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