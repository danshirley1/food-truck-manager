/**
 * Web-compatible scenario loader for Food Truck Manager
 * Uses inline JSON data instead of file system operations
 */

import { Scenario, DifficultyLevel, ScenarioTag, ScenarioContext } from '@food-truck-manager/shared';

// Static scenarios data (normally this would be imported from a JSON file or API)
const STATIC_SCENARIOS: Scenario[] = [
  {
    id: "customer-complaint-early-1",
    title: "First Customer Complaint",
    text: "A customer approaches your truck looking frustrated. They claim their burrito was cold and want a refund. It's only your third day, and word of mouth is crucial for building your reputation. How do you handle this?",
    choices: [
      {
        id: "apologize-refund",
        label: "Apologize profusely and give a full refund plus a free meal voucher",
        effects: { money: -15, reputation: 5, energy: -2 },
        riskLevel: "safe"
      },
      {
        id: "partial-refund",
        label: "Offer a partial refund and remake the burrito",
        effects: { money: -8, reputation: 2, energy: -5 }
      },
      {
        id: "defend-quality",
        label: "Politely explain your cooking process and offer to remake it",
        effects: { money: 0, reputation: -3, energy: -3 }
      }
    ],
    tags: ["customer-service"],
    difficulty: "early",
    createdBy: "static"
  },
  {
    id: "ingredient-shortage-early-2",
    title: "Supply Chain Hiccup",
    text: "Your main ingredient supplier just called - they're running late and won't deliver until tomorrow. You have enough ingredients for maybe 20 more meals, but lunch rush typically serves 35-40 customers. What's your plan?",
    choices: [
      {
        id: "emergency-shopping",
        label: "Rush to the grocery store and buy ingredients at retail prices",
        effects: { money: -20, reputation: 3, energy: -8 }
      },
      {
        id: "limited-menu",
        label: "Post a 'limited menu today' sign and serve what you can",
        effects: { money: -5, reputation: -5, energy: -2 }
      },
      {
        id: "close-early",
        label: "Close early and use the time to plan better supply management",
        effects: { money: -25, reputation: -8, energy: 5 }
      }
    ],
    tags: ["supply-management"],
    difficulty: "early",
    createdBy: "static"
  },
  {
    id: "permit-inspector-mid-1",
    title: "Surprise Health Inspection",
    text: "A health inspector shows up during your busy lunch hour. Your truck is generally clean, but you notice some areas that could be better. The inspector is watching your every move while customers wait in line.",
    choices: [
      {
        id: "halt-service",
        label: "Stop serving immediately and deep clean everything",
        effects: { money: -35, reputation: -5, energy: -10 }
      },
      {
        id: "continue-carefully",
        label: "Continue serving but be extra careful about cleanliness",
        effects: { money: 5, reputation: -2, energy: -8 }
      },
      {
        id: "charm-inspector",
        label: "Engage the inspector in friendly conversation while working",
        effects: { money: 0, reputation: 8, energy: -5 }
      }
    ],
    tags: ["permits"],
    difficulty: "mid",
    createdBy: "static"
  },
  {
    id: "equipment-breakdown-mid-2",
    title: "Grill Emergency",
    text: "Your main grill just died in the middle of prep for the dinner rush. You have a backup hot plate, but it's much slower. Customers are already starting to line up, and you smell money in the air.",
    choices: [
      {
        id: "emergency-repair",
        label: "Call an emergency repair service (expensive but quick)",
        effects: { money: -50, reputation: 5, energy: -5 }
      },
      {
        id: "backup-equipment",
        label: "Use the hot plate and apologize for slower service",
        effects: { money: -15, reputation: -8, energy: -12 }
      },
      {
        id: "partner-kitchen",
        label: "Ask a nearby restaurant if you can use their kitchen briefly",
        effects: { money: -20, reputation: 10, energy: -8 }
      }
    ],
    tags: ["equipment"],
    difficulty: "mid",
    createdBy: "static"
  },
  {
    id: "competitor-war-late-1",
    title: "Food Truck Rivalry",
    text: "A new gourmet food truck just parked across the street with lower prices and flashy marketing. You can see your regular customers checking them out. Your lunch sales are down 40% this week. Time for a strategic response.",
    choices: [
      {
        id: "price-war",
        label: "Match their prices and add value with larger portions",
        effects: { money: -25, reputation: 8, energy: -10 }
      },
      {
        id: "quality-focus",
        label: "Emphasize your superior ingredients and cooking techniques",
        effects: { money: -10, reputation: 15, energy: -5 }
      },
      {
        id: "collaboration",
        label: "Approach them about coordinating locations to help both trucks",
        effects: { money: 10, reputation: 5, energy: -3 }
      }
    ],
    tags: ["competition"],
    difficulty: "late",
    createdBy: "static"
  },
  {
    id: "weather-crisis-late-2",
    title: "Storm Warning",
    text: "The weather forecast shows severe thunderstorms for the next three days - right during the weekend festival where you expected to make 40% of this week's revenue. Other vendors are already packing up.",
    choices: [
      {
        id: "weather-through",
        label: "Stay and serve with protective covers, rain or shine",
        effects: { money: 15, reputation: 12, energy: -15 }
      },
      {
        id: "indoor-catering",
        label: "Pivot to indoor catering for local offices and events",
        effects: { money: -10, reputation: 8, energy: -12 }
      },
      {
        id: "strategic-rest",
        label: "Take the weekend off and use time for deep maintenance",
        effects: { money: -30, reputation: -5, energy: 15 }
      }
    ],
    tags: ["weather"],
    difficulty: "late",
    createdBy: "static"
  },
  {
    id: "social-media-crisis-mid-3",
    title: "Viral Video Problem",
    text: "Someone posted a video of your truck on social media claiming you overcharged them. It's going viral with mixed comments. Some defend you, others are piling on. The story isn't entirely accurate, but perception is reality.",
    choices: [
      {
        id: "public-response",
        label: "Post a detailed public response with receipts and explanation",
        effects: { money: 0, reputation: 5, energy: -8 }
      },
      {
        id: "private-resolution",
        label: "Reach out privately to resolve it and offer compensation",
        effects: { money: -25, reputation: -2, energy: -5 }
      },
      {
        id: "ignore-storm",
        label: "Ignore it and let it blow over naturally",
        effects: { money: -5, reputation: -12, energy: -2 }
      }
    ],
    tags: ["community-event"],
    difficulty: "mid",
    createdBy: "static"
  },
  {
    id: "expansion-opportunity-late-3",
    title: "Second Truck Opportunity",
    text: "A successful local entrepreneur offers to finance a second food truck for you, with you keeping 60% ownership. It would double your potential income but also double your responsibilities and risks.",
    choices: [
      {
        id: "accept-partnership",
        label: "Accept the deal and expand your operation",
        effects: { money: -30, reputation: 15, energy: -20 }
      },
      {
        id: "counter-offer",
        label: "Counter-offer for better terms and more control",
        effects: { money: -15, reputation: 5, energy: -10 }
      },
      {
        id: "stay-solo",
        label: "Decline politely and focus on perfecting your current truck",
        effects: { money: 10, reputation: 0, energy: 8 }
      }
    ],
    tags: ["expansion"],
    difficulty: "late",
    createdBy: "static"
  }
];

export class WebScenarioLoader {
  private static scenarios = STATIC_SCENARIOS;

  /**
   * Get a random scenario based on context (web version)
   */
  static getScenario(context: ScenarioContext): Scenario | null {
    try {
      const availableScenarios = this.filterScenariosByContext(context);

      if (availableScenarios.length === 0) {
        console.warn('No scenarios available for context:', context);
        return null;
      }

      // Simple random selection
      const randomIndex = Math.floor(Math.random() * availableScenarios.length);
      return availableScenarios[randomIndex];
    } catch (error) {
      console.error('Error loading scenario:', error);
      return null;
    }
  }

  /**
   * Filter scenarios by context
   */
  private static filterScenariosByContext(context: ScenarioContext): Scenario[] {
    return this.scenarios.filter(scenario => {
      // Filter by difficulty level
      if (scenario.difficulty !== context.difficultyLevel) {
        return false;
      }

      // Avoid repeating recent scenario types
      if (context.recentChoices.length > 0) {
        const hasRecentTag = scenario.tags.some(tag =>
          context.recentChoices.includes(tag)
        );
        if (hasRecentTag && context.recentChoices.length > 1) {
          return false; // Skip if we've seen this type recently
        }
      }

      return true;
    });
  }

  /**
   * Get all scenarios (for debugging)
   */
  static getAllScenarios(): Scenario[] {
    return [...this.scenarios];
  }

  /**
   * Get scenarios by difficulty
   */
  static getScenariosByDifficulty(difficulty: DifficultyLevel): Scenario[] {
    return this.scenarios.filter(s => s.difficulty === difficulty);
  }
}