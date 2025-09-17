'use client';

import { useEffect } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { ScenarioCard } from '@/components/ScenarioCard';
import { GameOverCard } from '@/components/GameOverCard';
import { LoadingCard } from '@/components/LoadingCard';
import { useGame } from '@/hooks/useGame';
import { Choice } from '@/lib/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Play } from 'lucide-react';

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
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Food Truck Manager</CardTitle>
            <CardDescription className="text-base">
              Manage your food truck through 15 days of business! Balance your money, reputation, and energy to succeed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleStartGame} className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Start Your Food Truck Adventure
            </Button>
          </CardContent>
        </Card>
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
          <LoadingCard />
        )}
      </div>
    </div>
  );
}
