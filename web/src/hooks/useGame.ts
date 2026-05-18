'use client';

import { useState, useCallback } from 'react';
import {
  GameState,
  GameStateManager,
  Scenario,
  Choice,
  MenuOption,
  ScenarioContext,
} from '@/lib/game';
import { ApiScenarioLoader } from '@/lib/scenarios/api-scenario-loader';
import { getVenueThemeHint } from '@/lib/ai/prompts';
import { useMenuImages } from '@/hooks/useMenuImages';

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(() =>
    GameStateManager.createNew(undefined, undefined, 0)
  );
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null
  );
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  const { loadMenuImages, isMenuImageLoading } = useMenuImages(setCurrentScenario);

  const clearTurnSelection = useCallback(() => {
    setSelectedBusinessId(null);
    setSelectedMenuId(null);
  }, []);

  const buildScenarioContext = useCallback((state: GameState): ScenarioContext => {
    const difficulty = GameStateManager.getCurrentDifficulty(state.turn);

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

    const recentHistory = state.choiceHistory.slice(-5);
    const recentScenarioIds = recentHistory.map((record) => record.scenarioId);
    const recentLocations = recentHistory
      .map((record) => record.dayLocation)
      .filter((loc): loc is string => Boolean(loc));
    const recentCrowdVibes = recentHistory
      .map((record) => record.dayCrowdVibe)
      .filter((vibe): vibe is string => Boolean(vibe));
    return {
      currentResources: state.resources,
      turn: state.turn,
      difficultyLevel: difficulty,
      recentChoices,
      recentScenarioIds,
      recentLocations,
      recentCrowdVibes,
      venueThemeHint: getVenueThemeHint(state.turn),
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
        clearTurnSelection();
        loadMenuImages(scenario);
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
    [buildScenarioContext, clearTurnSelection, loadMenuImages]
  );

  const submitTurn = useCallback(async () => {
    if (!currentScenario || !selectedBusinessId || !selectedMenuId) return;

    const businessChoice = currentScenario.choices.find(
      (c) => c.id === selectedBusinessId
    );
    const menuOption = currentScenario.menuOptions.find(
      (m) => m.id === selectedMenuId
    );
    if (!businessChoice || !menuOption) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const newGameState = GameStateManager.applyTurn(
        gameState,
        currentScenario,
        businessChoice,
        menuOption
      );

      setGameState(newGameState);
      clearTurnSelection();

      if (!newGameState.gameOver) {
        setTimeout(() => {
          void fetchScenario(newGameState);
        }, 1000);
      } else {
        setCurrentScenario(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to submit turn:', error);
      setIsLoading(false);
    }
  }, [
    gameState,
    currentScenario,
    selectedBusinessId,
    selectedMenuId,
    fetchScenario,
    clearTurnSelection,
  ]);

  const selectBusiness = useCallback((choice: Choice) => {
    setSelectedBusinessId(choice.id);
  }, []);

  const selectMenu = useCallback((option: MenuOption) => {
    setSelectedMenuId(option.id);
  }, []);

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

  const onVerdictImageLoaded = useCallback((url: string) => {
    setGameState((prev) => {
      if (!prev.lastMenuFeedback || prev.lastMenuFeedback.menuImageUrl) {
        return prev;
      }
      return {
        ...prev,
        lastMenuFeedback: { ...prev.lastMenuFeedback, menuImageUrl: url },
      };
    });
  }, []);

  return {
    gameState,
    currentScenario,
    isLoading,
    loadError,
    selectedBusinessId,
    selectedMenuId,
    selectBusiness,
    selectMenu,
    isMenuImageLoading,
    submitTurn,
    startNewGame,
    restartGame,
    retryLoadScenario,
    onVerdictImageLoaded,
  };
}
