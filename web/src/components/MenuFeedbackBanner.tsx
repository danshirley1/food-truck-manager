'use client';

import { MenuFeedback } from '@/lib/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Star, ThumbsUp, Zap } from 'lucide-react';
import { ChefsKudosIcon } from '@/components/ChefsKudosIcon';
import { MenuSpecialImage } from '@/components/MenuSpecialImage';

interface MenuFeedbackBannerProps {
  feedback: MenuFeedback;
}

function KudosStars({ count }: { count: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <Star
          key={n}
          className={`w-5 h-5 ${
            n <= count ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

function EffectBadges({ effects }: { effects: MenuFeedback['menuEffects'] }) {
  const items = [];
  if (effects.money) {
    items.push(
      <Badge
        key="money"
        variant={effects.money > 0 ? 'default' : 'destructive'}
        className="gap-1"
      >
        <Coins className="w-3 h-3" />
        {effects.money > 0 ? `+${effects.money}` : effects.money}
      </Badge>
    );
  }
  if (effects.reputation) {
    items.push(
      <Badge
        key="reputation"
        variant={effects.reputation > 0 ? 'default' : 'destructive'}
        className="gap-1"
      >
        <ThumbsUp className="w-3 h-3" />
        {effects.reputation > 0 ? `+${effects.reputation}` : effects.reputation}%
      </Badge>
    );
  }
  if (effects.energy) {
    items.push(
      <Badge
        key="energy"
        variant={effects.energy > 0 ? 'default' : 'destructive'}
        className="gap-1"
      >
        <Zap className="w-3 h-3" />
        {effects.energy > 0 ? `+${effects.energy}` : effects.energy}%
      </Badge>
    );
  }
  if (items.length === 0) return null;
  return <div className="flex flex-wrap gap-2">{items}</div>;
}

export function MenuFeedbackBanner({ feedback }: MenuFeedbackBannerProps) {
  return (
    <Card className="w-full mb-6 border-amber-200 bg-amber-50/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-900">
          <ChefsKudosIcon size="sm" />
          Chef&apos;s Kudos: The Verdict
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <MenuSpecialImage
          src={feedback.menuImageUrl}
          alt={feedback.menuLabel}
          size="verdict"
          className="mb-2"
        />
        <p className="text-sm font-medium text-foreground">
          Your special: {feedback.menuLabel}
        </p>
        <div className="flex items-center gap-3">
          <KudosStars count={feedback.stars} />
          <span className="text-sm text-muted-foreground">{feedback.message}</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">How that special landed:</p>
          <EffectBadges effects={feedback.menuEffects} />
          <p className="text-sm text-foreground mt-3 leading-relaxed">
            {feedback.verdictReason}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
