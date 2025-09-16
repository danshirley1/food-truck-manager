'use client';

import { useEffect } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { ScenarioCard } from '@/components/ScenarioCard';
import { GameOverCard } from '@/components/GameOverCard';
import { useGame } from '@/hooks/useGame';
import { Choice } from '@/lib/shared';

export default function Home() {
  const {
    gameState,
    currentScenario,
    isLoading,
    makeChoice,
    startNewGame,
    restartGame,
    loadNextScenario
  } = useGame();

  useEffect(() => {
    // Load first scenario when component mounts
    if (gameState.turn === 0 && !currentScenario && !isLoading) {
      loadNextScenario();
    }
  }, [gameState.turn, currentScenario, isLoading, loadNextScenario]);

  const handleStartGame = () => {
    startNewGame();
  };

  const handleChoice = (choice: Choice) => {
    makeChoice(choice);
  };

  if (gameState.turn === 0 && !currentScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🚚</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Food Truck Manager</h1>
          <p className="text-gray-600 mb-6">
            Manage your food truck through 15 days of business! Balance your money, reputation, and energy to succeed.
          </p>
          <button
            onClick={handleStartGame}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Start Your Food Truck Adventure
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        <GameBoard gameState={gameState} />

        {gameState.gameOver && (
          <GameOverCard gameState={gameState} onRestart={restartGame} />
        )}

        {!gameState.gameOver && currentScenario && (
          <ScenarioCard
            scenario={currentScenario}
            onChoice={handleChoice}
            disabled={isLoading}
          />
        )}

        {isLoading && !gameState.gameOver && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-gray-600">Loading next scenario...</div>
          </div>
        )}
      </div>
    </div>
  );
}
