'use client';

import { Scenario, Choice } from '@/lib/shared';

interface ScenarioCardProps {
  scenario: Scenario;
  onChoice: (choice: Choice) => void;
  disabled?: boolean;
}

export function ScenarioCard({ scenario, onChoice, disabled }: ScenarioCardProps) {
  const formatResourceChange = (value: number | undefined): string => {
    if (!value) return '';
    return value > 0 ? `+${value}` : `${value}`;
  };

  const getEffectColor = (value: number | undefined): string => {
    if (!value) return '';
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  const renderEffects = (effects: Choice['effects']) => {
    const items = [];

    if (effects.money) {
      items.push(
        <span key="money" className={`inline-flex items-center ${getEffectColor(effects.money)}`}>
          💰 {formatResourceChange(effects.money)}
        </span>
      );
    }

    if (effects.reputation) {
      items.push(
        <span key="reputation" className={`inline-flex items-center ${getEffectColor(effects.reputation)}`}>
          ⭐ {formatResourceChange(effects.reputation)}%
        </span>
      );
    }

    if (effects.energy) {
      items.push(
        <span key="energy" className={`inline-flex items-center ${getEffectColor(effects.energy)}`}>
          ⚡ {formatResourceChange(effects.energy)}%
        </span>
      );
    }

    return items.length > 0 ? (
      <div className="flex flex-wrap gap-2 text-sm">
        {items}
      </div>
    ) : null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🎯 {scenario.title}</h3>
        <p className="text-gray-600 leading-relaxed">{scenario.text}</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-cyan-700">Your options:</h4>
        {scenario.choices.map((choice, index) => (
          <button
            key={choice.id}
            onClick={() => onChoice(choice)}
            disabled={disabled}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-medium text-gray-800 mb-2">
              {index + 1}. {choice.label}
            </div>
            {renderEffects(choice.effects)}
          </button>
        ))}
      </div>
    </div>
  );
}