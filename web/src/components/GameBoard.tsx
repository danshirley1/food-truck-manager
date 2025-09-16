'use client';

import { GameState, Resources } from '@/lib/shared';

interface GameBoardProps {
  gameState: GameState;
}

export function GameBoard({ gameState }: GameBoardProps) {
  const { resources, turn } = gameState;

  const getResourceColor = (value: number, type: 'money' | 'reputation' | 'energy') => {
    if (type === 'money') {
      if (value < 20) return 'text-red-500';
      if (value < 50) return 'text-yellow-500';
      return 'text-green-500';
    }
    if (value < 20) return 'text-red-500';
    if (value < 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getResourceBg = (value: number, type: 'money' | 'reputation' | 'energy') => {
    if (type === 'money') {
      if (value < 20) return 'bg-red-100 border-red-300';
      if (value < 50) return 'bg-yellow-100 border-yellow-300';
      return 'bg-green-100 border-green-300';
    }
    if (value < 20) return 'bg-red-100 border-red-300';
    if (value < 50) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🚚 Food Truck Manager</h2>
        <div className="text-lg font-semibold text-orange-600">
          Day {turn}/15
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border-2 ${getResourceBg(resources.money, 'money')}`}>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-sm font-medium text-gray-600">Money</div>
              <div className={`text-xl font-bold ${getResourceColor(resources.money, 'money')}`}>
                ${resources.money}
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${getResourceBg(resources.reputation, 'reputation')}`}>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="text-sm font-medium text-gray-600">Reputation</div>
              <div className={`text-xl font-bold ${getResourceColor(resources.reputation, 'reputation')}`}>
                {resources.reputation}%
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${getResourceBg(resources.energy, 'energy')}`}>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="text-sm font-medium text-gray-600">Energy</div>
              <div className={`text-xl font-bold ${getResourceColor(resources.energy, 'energy')}`}>
                {resources.energy}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {gameState.gameOver && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 border-l-4 border-blue-400">
          <div className="text-blue-800 font-semibold">Game Over</div>
          {gameState.score && (
            <div className="text-blue-600">Final Score: {gameState.score}</div>
          )}
        </div>
      )}
    </div>
  );
}