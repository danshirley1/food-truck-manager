'use client';

import { Scenario, Choice } from '@/lib/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Star, Zap, Target } from 'lucide-react';

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

  const getEffectVariant = (value: number | undefined) => {
    if (!value) return 'secondary';
    return value > 0 ? 'default' : 'destructive';
  };

  const renderEffects = (effects: Choice['effects']) => {
    const items = [];

    if (effects.money) {
      items.push(
        <Badge key="money" variant={getEffectVariant(effects.money)} className="gap-1">
          <Coins className="w-3 h-3" />
          {formatResourceChange(effects.money)}
        </Badge>
      );
    }

    if (effects.reputation) {
      items.push(
        <Badge key="reputation" variant={getEffectVariant(effects.reputation)} className="gap-1">
          <Star className="w-3 h-3" />
          {formatResourceChange(effects.reputation)}%
        </Badge>
      );
    }

    if (effects.energy) {
      items.push(
        <Badge key="energy" variant={getEffectVariant(effects.energy)} className="gap-1">
          <Zap className="w-3 h-3" />
          {formatResourceChange(effects.energy)}%
        </Badge>
      );
    }

    return items.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-3">
        {items}
      </div>
    ) : null;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="w-5 h-5 text-orange-600" />
          {scenario.title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground mb-6 leading-relaxed">{scenario.text}</p>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Your options:</h4>
          {scenario.choices.map((choice, index) => (
            <Button
              key={choice.id}
              variant="outline"
              className="w-full justify-start h-auto p-4 text-left disabled:opacity-50"
              onClick={() => onChoice(choice)}
              disabled={disabled}
            >
              <div className="w-full">
                <div className="font-medium mb-1">
                  {index + 1}. {choice.label}
                </div>
                {renderEffects(choice.effects)}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}