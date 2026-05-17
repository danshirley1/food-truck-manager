/**
 * Menu special fit scoring for Chef's Kudos.
 */

import { DifficultyLevel, MenuOption, ResourceEffects } from '../types';

const MIN_TIER_SPREAD: Record<DifficultyLevel, number> = {
  early: 5,
  mid: 6,
  late: 8,
};

export function computeMenuFitScore(effects: ResourceEffects): number {
  return (
    (effects.money ?? 0) * 0.4 +
    (effects.reputation ?? 0) * 0.8 +
    (effects.energy ?? 0) * 0.6
  );
}

export function rankMenuStars(
  menuOptions: MenuOption[],
  selectedId: string
): 1 | 2 | 3 {
  const ranked = [...menuOptions].sort(
    (a, b) => computeMenuFitScore(b.effects) - computeMenuFitScore(a.effects)
  );
  const rank = ranked.findIndex((m) => m.id === selectedId);
  if (rank <= 0) return 3;
  if (rank === 1) return 2;
  return 1;
}

/** True when three menu options form distinct best / middle / worst tiers for star ranking */
export function menuOptionsHaveDistinctTiers(
  options: Array<{ effects: ResourceEffects }>,
  difficulty: DifficultyLevel
): boolean {
  if (options.length !== 3) return false;

  const scores = options.map((o) => computeMenuFitScore(o.effects));
  const sorted = [...scores].sort((a, b) => b - a);

  if (new Set(sorted.map((s) => s.toFixed(2))).size < 3) return false;
  if (sorted[0] - sorted[2] < MIN_TIER_SPREAD[difficulty]) return false;

  return sorted[0] > sorted[1] && sorted[1] > sorted[2];
}

export function menuFeedbackMessage(stars: 1 | 2 | 3): string {
  switch (stars) {
    case 3:
      return "Perfect for today's crowd!";
    case 2:
      return 'A decent special — room to improve.';
    case 1:
      return 'That special missed the mark for this venue.';
  }
}
