import type { Choice, MenuOption, Scenario } from '@/lib/types';

export function makeMenuOptions(): MenuOption[] {
  return [
    {
      id: 'menu-best',
      label: 'Gourmet Wrap',
      description: 'Fresh grilled wrap with seasonal greens.',
      effects: { money: 10, reputation: 8, energy: -4 },
      verdictReason: 'Perfect for the lunch crowd.',
    },
    {
      id: 'menu-mid',
      label: 'Garden Salad',
      description: 'Crisp seasonal salad with house dressing.',
      effects: { money: 5, reputation: 4, energy: -2 },
      verdictReason: 'Fine but not the star of the day.',
    },
    {
      id: 'menu-worst',
      label: 'Heavy Stew',
      description: 'Rich slow-cooked stew for cold weather.',
      effects: { money: -2, reputation: -4, energy: -6 },
      verdictReason: 'Too heavy for this crowd.',
    },
  ];
}

export function makeScenario(overrides?: Partial<Scenario>): Scenario {
  return {
    id: 'test-scenario',
    title: 'Test Day',
    text: 'A test scenario for unit tests.',
    choices: [
      {
        id: 'biz-a',
        label: 'Option A',
        effects: { money: 5, reputation: 3, energy: -2 },
        riskLevel: 'safe',
      },
      {
        id: 'biz-b',
        label: 'Option B',
        effects: { money: -3, reputation: 5, energy: -1 },
        riskLevel: 'moderate',
      },
    ],
    tags: ['customer-service'],
    difficulty: 'early',
    createdBy: 'static',
    dayContext: {
      location: 'Downtown Plaza',
      crowdDetail: 'Hungry office workers on lunch break.',
      crowdVibe: 'in a hurry',
    },
    menuPrompt: 'Pick a lunch special for today',
    menuOptions: makeMenuOptions(),
    ...overrides,
  };
}

export function makeBusinessChoice(overrides?: Partial<Choice>): Choice {
  return {
    id: 'biz-a',
    label: 'Option A',
    effects: { money: 5, reputation: 3, energy: -2 },
    riskLevel: 'safe',
    ...overrides,
  };
}

export function makeGeneratedScenarioRaw(overrides?: Record<string, unknown>) {
  return {
    title: 'Rainy Lunch Rush',
    text: 'A sudden downpour sends office workers sprinting to your truck for comfort food.',
    tags: ['weather'],
    difficulty: 'early',
    dayContext: {
      location: 'Downtown Plaza',
      crowdDetail: 'Office workers escaping the rain want something warm and fast.',
      crowdVibe: 'wet and impatient',
    },
    menuPrompt: 'Choose a rainy-day special',
    choices: [
      {
        label: 'Offer shelter seating',
        effects: { money: -5, reputation: 8, energy: -4 },
        riskLevel: 'moderate',
      },
      {
        label: 'Speed up the line',
        effects: { money: 6, reputation: 2, energy: -6 },
        riskLevel: 'risky',
      },
    ],
    menuOptions: [
      {
        label: 'Gourmet Wrap',
        description: 'Fresh grilled wrap with seasonal greens.',
        effects: { money: 10, reputation: 8, energy: -4 },
        verdictReason: 'Perfect for the lunch crowd.',
        imageSearchTerm: 'gourmet chicken wrap',
      },
      {
        label: 'Garden Salad',
        description: 'Crisp seasonal salad with house dressing.',
        effects: { money: 5, reputation: 4, energy: -2 },
        verdictReason: 'Fine but not the star of the day.',
        imageSearchTerm: 'garden salad bowl',
      },
      {
        label: 'Heavy Stew',
        description: 'Rich slow-cooked stew for cold weather.',
        effects: { money: -2, reputation: -4, energy: -6 },
        verdictReason: 'Too heavy for this crowd.',
        imageSearchTerm: 'beef stew bowl',
      },
    ],
    ...overrides,
  };
}
