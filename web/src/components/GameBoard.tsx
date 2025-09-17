'use client';

import { GameState } from '@/lib/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Star, Zap, Truck } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
}

export function GameBoard({ gameState }: GameBoardProps) {
  const { resources, turn } = gameState;

  const getResourceVariant = (value: number, type: 'money' | 'reputation' | 'energy') => {
    if (type === 'money') {
      if (value < 20) return 'destructive';
      if (value < 50) return 'secondary';
      return 'default';
    }
    if (value < 20) return 'destructive';
    if (value < 50) return 'secondary';
    return 'default';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-orange-600" />
            <div>
              <CardTitle className="text-2xl">Food Truck Manager</CardTitle>
              <CardDescription>Manage your resources wisely!</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Day {turn}/15
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Money</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">${resources.money}</p>
                    <Badge variant={getResourceVariant(resources.money, 'money')}>
                      {resources.money < 20 ? 'Low' : resources.money < 50 ? 'Medium' : 'Good'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-100">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Reputation</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">{resources.reputation}%</p>
                    <Badge variant={getResourceVariant(resources.reputation, 'reputation')}>
                      {resources.reputation < 20 ? 'Poor' : resources.reputation < 50 ? 'Fair' : 'Great'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Energy</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">{resources.energy}%</p>
                    <Badge variant={getResourceVariant(resources.energy, 'energy')}>
                      {resources.energy < 20 ? 'Tired' : resources.energy < 50 ? 'Okay' : 'Fresh'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {gameState.gameOver && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
            <CardContent className="p-4">
              <div className="text-blue-800 font-semibold text-lg">Game Over</div>
              {gameState.score && (
                <div className="text-blue-600 text-lg">Final Score: {gameState.score}</div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}