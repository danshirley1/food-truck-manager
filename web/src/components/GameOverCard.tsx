'use client';

import { GameState } from '@/lib/game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, XCircle, RotateCcw, Coins, Star, Zap } from 'lucide-react';

interface GameOverCardProps {
  gameState: GameState;
  onRestart: () => void;
}

export function GameOverCard({ gameState, onRestart }: GameOverCardProps) {
  const getEndReasonData = () => {
    switch (gameState.endReason) {
      case 'victory':
        return {
          icon: <Trophy className="w-12 h-12 text-yellow-500" />,
          title: 'Victory!',
          message: 'You successfully managed your food truck for 15 days!',
          variant: 'default' as const,
          bgClass: 'bg-green-50 border-green-200'
        };
      case 'burnout':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          title: 'Burnout',
          message: 'You collapsed from exhaustion. Running a food truck is tough work!',
          variant: 'destructive' as const,
          bgClass: 'bg-red-50 border-red-200'
        };
      case 'reputation-death':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          title: 'Reputation Ruined',
          message: 'Word spread about poor service. No customers want to visit your truck.',
          variant: 'destructive' as const,
          bgClass: 'bg-red-50 border-red-200'
        };
      case 'bankruptcy':
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          title: 'Bankruptcy',
          message: 'You ran out of money and had to close down the business.',
          variant: 'destructive' as const,
          bgClass: 'bg-red-50 border-red-200'
        };
      default:
        return {
          icon: <XCircle className="w-12 h-12 text-gray-500" />,
          title: 'Game Over',
          message: 'Your food truck adventure has ended.',
          variant: 'secondary' as const,
          bgClass: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const { icon, title, message, bgClass } = getEndReasonData();

  return (
    <Card className={`w-full max-w-md mx-auto ${bgClass}`}>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-background flex items-center justify-center">
          {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base">{message}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-green-100">
                <Coins className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-1">Money</div>
            <div className="font-bold">${gameState.resources.money}</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-yellow-100">
                <Star className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-1">Reputation</div>
            <div className="font-bold">{gameState.resources.reputation}%</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-blue-100">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-1">Energy</div>
            <div className="font-bold">{gameState.resources.energy}%</div>
          </div>
        </div>

        {gameState.score && (
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              Final Score: {gameState.score}
            </Badge>
          </div>
        )}

        <Button className="w-full" onClick={onRestart} size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </CardContent>
    </Card>
  );
}