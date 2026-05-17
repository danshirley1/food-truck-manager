'use client';

import { Scenario, Choice, MenuOption, RiskLevel } from '@/lib/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Coins,
  ThumbsUp,
  Zap,
  Briefcase,
  MapPin,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOTAL_DAYS = 15;

interface TurnDecisionCardProps {
  dayNumber: number;
  scenario: Scenario;
  selectedBusinessId: string | null;
  selectedMenuId: string | null;
  onSelectBusiness: (choice: Choice) => void;
  onSelectMenu: (option: MenuOption) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

function formatResourceChange(value: number | undefined): string {
  if (!value) return '';
  return value > 0 ? `+${value}` : `${value}`;
}

function getEffectVariant(value: number | undefined) {
  if (!value) return 'secondary';
  return value > 0 ? 'default' : 'destructive';
}

function RiskBadge({ level }: { level?: RiskLevel }) {
  if (!level) return null;
  const config = {
    safe: { label: 'Low risk', variant: 'secondary' as const },
    moderate: { label: 'Medium risk', variant: 'outline' as const },
    risky: { label: 'High risk', variant: 'destructive' as const },
  };
  const { label, variant } = config[level];
  return (
    <Badge variant={variant} className="text-xs shrink-0">
      {label}
    </Badge>
  );
}

function EffectBadges({ effects }: { effects: Choice['effects'] }) {
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
      <Badge
        key="reputation"
        variant={getEffectVariant(effects.reputation)}
        className="gap-1"
      >
        <ThumbsUp className="w-3 h-3" />
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
  if (items.length === 0) return null;
  return <div className="flex flex-wrap gap-2 mt-2">{items}</div>;
}

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
      {n}
    </span>
  );
}

function selectionCardClass(selected: boolean, extra?: string) {
  return cn(
    'w-full rounded-lg border-2 p-4 text-left transition-colors duration-150 cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    selected
      ? 'border-orange-500 bg-orange-50/50 hover:bg-orange-100'
      : 'border-border bg-background hover:bg-orange-50 hover:border-orange-300',
    extra
  );
}

export function TurnDecisionCard({
  dayNumber,
  scenario,
  selectedBusinessId,
  selectedMenuId,
  onSelectBusiness,
  onSelectMenu,
  onSubmit,
  disabled,
}: TurnDecisionCardProps) {
  const canSubmit =
    !disabled && selectedBusinessId !== null && selectedMenuId !== null;

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-3 space-y-4">
        <Badge variant="outline" className="w-fit">
          Today (day {dayNumber}/{TOTAL_DAYS})
        </Badge>
        <p className="flex items-center gap-2 text-base font-semibold text-foreground">
          <MapPin className="w-4 h-4 shrink-0 text-orange-600" />
          <span>
            Location: {scenario.dayContext.location}
          </span>
        </p>
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50/60 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-orange-900">
            <Users className="w-4 h-4 shrink-0" />
            The crowd today
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {scenario.dayContext.crowdDetail}
          </p>
          <p className="text-sm font-medium italic text-orange-800 border-l-4 border-orange-400 pl-3">
            {scenario.dayContext.crowdVibe}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Step 1 */}
        <section>
          <div className="flex items-center gap-3 mb-3 mt-4">
            <StepNumber n={1} />
            <h3 className="font-semibold text-lg">Business decision</h3>
          </div>
          <CardTitle className="flex items-center gap-2 text-xl mb-2 pl-11">
            <Briefcase className="w-5 h-5 text-orange-600" />
            {scenario.title}
          </CardTitle>
          <p className="text-muted-foreground mb-4 pl-11 leading-relaxed">
            {scenario.text}
          </p>
          <div className="space-y-3 pl-11">
            {scenario.choices.map((choice, index) => (
              <button
                key={choice.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectBusiness(choice)}
                className={selectionCardClass(selectedBusinessId === choice.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">
                    {index + 1}. {choice.label}
                  </span>
                  <RiskBadge level={choice.riskLevel} />
                </div>
                <EffectBadges effects={choice.effects} />
              </button>
            ))}
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <StepNumber n={2} />
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-600" />
              Today&apos;s special
            </h3>
          </div>
          <p className="text-muted-foreground mb-4 pl-11">{scenario.menuPrompt}</p>
          <p className="text-xs text-muted-foreground mb-3 pl-11 italic">
            Pick what fits the crowd — choose wisely!
          </p>
          <div className="space-y-3 pl-11">
            {scenario.menuOptions.map((option, index) => (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectMenu(option)}
                className={selectionCardClass(selectedMenuId === option.id, 'font-medium')}
              >
                {index + 1}. {option.label}
              </button>
            ))}
          </div>
        </section>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            disabled={!canSubmit}
            onClick={onSubmit}
            className={cn(
              'h-auto min-w-[12rem] rounded-full px-10 py-3 text-base font-bold shadow-lg border-0',
              'enabled:bg-green-600 enabled:text-white enabled:hover:bg-green-700',
              'enabled:hover:scale-105 enabled:hover:shadow-xl enabled:active:scale-95',
              'transition-all duration-200',
              'disabled:bg-neutral-300 disabled:text-neutral-100 disabled:hover:bg-neutral-300',
              'disabled:hover:scale-100 disabled:shadow-none disabled:cursor-not-allowed'
            )}
          >
            Send it!
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
