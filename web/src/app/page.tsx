'use client';

import { GameBoard } from '@/components/GameBoard';
import { TurnDecisionCard } from '@/components/TurnDecisionCard';
import { MenuFeedbackBanner } from '@/components/MenuFeedbackBanner';
import { GameOverCard } from '@/components/GameOverCard';
import { LoadingCard } from '@/components/LoadingCard';
import { useGame } from '@/hooks/useGame';
import { TOTAL_TURNS } from '@/lib/game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Play, AlertCircle } from 'lucide-react';

export default function Home() {
  const {
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
  } = useGame();

  if (gameState.turn === 0 && !currentScenario && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Food Truck Manager</CardTitle>
            <CardDescription className="text-base">
              Manage your food truck through {TOTAL_TURNS} days of business! Balance your money,
              reputation, and energy to succeed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadError && (
              <div className="flex flex-col items-center gap-2 text-center text-sm">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-muted-foreground">{loadError}</p>
              </div>
            )}
            <Button
              onClick={loadError ? retryLoadScenario : startNewGame}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              {loadError ? 'Try again' : 'Start Your Food Truck Adventure'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-[1096px] mx-auto">
        <GameBoard gameState={gameState} />

        {gameState.gameOver && (
          <GameOverCard gameState={gameState} onRestart={restartGame} />
        )}

        {!gameState.gameOver && gameState.lastMenuFeedback && (
          <MenuFeedbackBanner
            feedback={gameState.lastMenuFeedback}
            onImageLoaded={onVerdictImageLoaded}
          />
        )}

        {!gameState.gameOver && currentScenario && !isLoading && (
          <TurnDecisionCard
            dayNumber={gameState.turn}
            scenario={currentScenario}
            selectedBusinessId={selectedBusinessId}
            selectedMenuId={selectedMenuId}
            onSelectBusiness={selectBusiness}
            onSelectMenu={selectMenu}
            onSubmit={submitTurn}
            disabled={isLoading}
            isMenuImageLoading={isMenuImageLoading}
          />
        )}

        {isLoading && !gameState.gameOver && <LoadingCard />}

        {!gameState.gameOver && loadError && !isLoading && (
          <Card className="w-full mb-6 border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <p className="text-sm text-muted-foreground">{loadError}</p>
                <Button onClick={retryLoadScenario} variant="outline">
                  Try again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
