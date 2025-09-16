'use client';

import { GameState } from '@/lib/shared';

interface GameOverCardProps {
  gameState: GameState;
  onRestart: () => void;
}

export function GameOverCard({ gameState, onRestart }: GameOverCardProps) {
  const getEndReasonMessage = () => {
    switch (gameState.endReason) {
      case 'victory':
        return {
          title: '🎉 Congratulations!',
          message: 'You successfully managed your food truck for 15 days!',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-800'
        };
      case 'burnout':
        return {
          title: '😴 Game Over - Burnout',
          message: 'You collapsed from exhaustion. Running a food truck is tough work!',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-800'
        };
      case 'reputation-death':
        return {
          title: '💔 Game Over - Reputation Ruined',
          message: 'Word spread about poor service. No customers want to visit your truck.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-800'
        };
      case 'bankruptcy':
        return {
          title: '💸 Game Over - Bankruptcy',
          message: 'You ran out of money and had to close down the business.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-800'
        };
      default:
        return {
          title: '🏁 Game Over',
          message: 'Your food truck adventure has ended.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-800'
        };
    }
  };

  const { title, message, bgColor, borderColor, textColor } = getEndReasonMessage();

  return (
    <div className={`rounded-lg border-l-4 ${bgColor} ${borderColor} p-6 mb-6`}>
      <div className={`font-bold text-xl mb-2 ${textColor}`}>
        {title}
      </div>
      <p className={`mb-4 ${textColor}`}>
        {message}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-sm text-gray-600">Final Money</div>
          <div className="font-bold">${gameState.resources.money}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">⭐</div>
          <div className="text-sm text-gray-600">Final Reputation</div>
          <div className="font-bold">{gameState.resources.reputation}%</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-sm text-gray-600">Final Energy</div>
          <div className="font-bold">{gameState.resources.energy}%</div>
        </div>
      </div>

      {gameState.score && (
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-yellow-600">🏆 Final Score: {gameState.score}</div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={onRestart}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}