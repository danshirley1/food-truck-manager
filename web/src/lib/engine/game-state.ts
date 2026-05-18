/**
 * Game state management for Food Truck Manager
 */

import {
  GameState,
  Resources,
  Choice,
  Scenario,
  MenuOption,
  EndReason,
  ChoiceRecord,
  ResourceEffects,
  TOTAL_TURNS,
  EARLY_TURN_END,
  MID_TURN_END,
  displayDay,
} from '../types';
import { MAX_CUMULATIVE_TURN_DELTA } from '../game-utils/effect-limits';
import { normalizeChoiceEffects } from '../types/ai-schemas';
import {
  rankMenuStars,
  menuFeedbackMessage,
} from '../game-utils/menu-scoring';
import { clamp, generateId } from '../game-utils/helpers';

function effectMagnitude(effects: ResourceEffects): number {
  return (
    Math.abs(effects.money ?? 0) +
    Math.abs(effects.reputation ?? 0) +
    Math.abs(effects.energy ?? 0)
  );
}

function capTurnEffects(effects: ResourceEffects): ResourceEffects {
  const magnitude = effectMagnitude(effects);
  if (magnitude <= MAX_CUMULATIVE_TURN_DELTA) {
    return effects;
  }
  const factor = MAX_CUMULATIVE_TURN_DELTA / magnitude;
  const scale = (n: number | undefined) =>
    n === undefined ? undefined : Math.round(n * factor);
  return {
    money: scale(effects.money),
    reputation: scale(effects.reputation),
    energy: scale(effects.energy),
  };
}

function mergeEffects(a: ResourceEffects, b: ResourceEffects): ResourceEffects {
  return {
    money: (a.money ?? 0) + (b.money ?? 0),
    reputation: (a.reputation ?? 0) + (b.reputation ?? 0),
    energy: (a.energy ?? 0) + (b.energy ?? 0),
  };
}

export class GameStateManager {
  /** @param startingTurn 0 for pre-start lobby; 1 when a run begins */
  static createNew(
    sessionId?: string,
    randomSeed?: string,
    startingTurn: 0 | 1 = 1
  ): GameState {
    const now = new Date();

    return {
      sessionId: sessionId || generateId(),
      turn: startingTurn,
      resources: {
        money: 100,
        reputation: 50,
        energy: 80,
      },
      gameOver: false,
      createdAt: now,
      updatedAt: now,
      randomSeed,
      chefsKudos: 0,
      choiceHistory: [],
      achievements: [],
    };
  }

  static applyTurn(
    gameState: GameState,
    scenario: Scenario,
    businessChoice: Choice,
    menuOption: MenuOption
  ): GameState {
    const resourcesBefore = { ...gameState.resources };
    const difficulty = scenario.difficulty;

    const businessEffects = normalizeChoiceEffects(
      businessChoice.effects,
      difficulty
    );
    const menuEffects = normalizeChoiceEffects(menuOption.effects, difficulty);
    const merged = capTurnEffects(mergeEffects(businessEffects, menuEffects));

    const menuStars = rankMenuStars(scenario.menuOptions, menuOption.id);
    const completedTurn = gameState.turn;

    const newResources: Resources = {
      money: clamp(resourcesBefore.money + (merged.money || 0), -999, 999),
      reputation: clamp(
        resourcesBefore.reputation + (merged.reputation || 0),
        0,
        100
      ),
      energy: clamp(resourcesBefore.energy + (merged.energy || 0), 0, 100),
    };

    const choiceRecord: ChoiceRecord = {
      turn: completedTurn,
      scenarioId: scenario.id,
      choiceId: businessChoice.id,
      effects: merged,
      businessEffects,
      menuEffects,
      menuChoiceId: menuOption.id,
      menuStars,
      dayLocation: scenario.dayContext.location,
      dayCrowdVibe: scenario.dayContext.crowdVibe,
      resourcesBefore,
      resourcesAfter: newResources,
      timestamp: new Date(),
    };

    const endCondition = this.checkEndConditions(newResources, completedTurn);

    let finalScore: number | undefined;
    if (endCondition.gameOver) {
      finalScore = this.calculateScore(newResources, completedTurn, choiceRecord);
    }

    return {
      ...gameState,
      turn: endCondition.gameOver ? completedTurn : gameState.turn + 1,
      resources: newResources,
      gameOver: endCondition.gameOver,
      endReason: endCondition.endReason,
      score: finalScore,
      chefsKudos: gameState.chefsKudos + menuStars,
      lastMenuFeedback: {
        turn: completedTurn,
        menuLabel: menuOption.label,
        stars: menuStars,
        message: menuFeedbackMessage(menuStars),
        verdictReason: menuOption.verdictReason,
        menuEffects,
        menuImageUrl: menuOption.imageUrl,
        imagePrompt: menuOption.imagePrompt,
        dayLocation: scenario.dayContext.location,
      },
      updatedAt: new Date(),
      choiceHistory: [...gameState.choiceHistory, choiceRecord],
    };
  }

  /** @deprecated Use applyTurn — kept for compatibility */
  static applyChoice(
    gameState: GameState,
    scenario: Scenario,
    choice: Choice
  ): GameState {
    const menu = scenario.menuOptions[0];
    if (!menu) {
      throw new Error('Scenario missing menu options');
    }
    return this.applyTurn(gameState, scenario, choice, menu);
  }

  private static checkEndConditions(
    resources: Resources,
    turn: number
  ): { gameOver: boolean; endReason?: EndReason } {
    if (resources.energy <= 0) {
      return { gameOver: true, endReason: 'burnout' };
    }

    if (resources.reputation <= 0) {
      return { gameOver: true, endReason: 'reputation-death' };
    }

    if (resources.money <= 0) {
      return { gameOver: true, endReason: 'bankruptcy' };
    }

    if (turn >= TOTAL_TURNS) {
      return { gameOver: true, endReason: 'victory' };
    }

    return { gameOver: false };
  }

  private static calculateScore(
    resources: Resources,
    turnsCompleted: number,
    lastChoice: ChoiceRecord
  ): number {
    const baseScore =
      resources.money * 0.4 +
      resources.reputation * 0.8 +
      resources.energy * 0.6;

    const turnBonus = turnsCompleted * 10;

    let multiplier = 1.0;
    const minResource = Math.min(
      resources.money,
      resources.reputation,
      resources.energy
    );

    if (minResource >= 70) {
      multiplier = 1.5;
    } else if (minResource >= 40) {
      multiplier = 1.2;
    }

    return Math.round((baseScore + turnBonus) * multiplier);
  }

  static getCurrentDifficulty(turn: number): 'early' | 'mid' | 'late' {
    if (turn <= EARLY_TURN_END) return 'early';
    if (turn <= MID_TURN_END) return 'mid';
    return 'late';
  }

  static getGameStatus(gameState: GameState): string {
    const { resources, turn, gameOver, endReason } = gameState;

    if (gameOver) {
      const messages = {
        victory: `🎉 Victory! You successfully managed your food truck for ${TOTAL_TURNS} days!`,
        burnout: '😴 Game Over - You burned out from exhaustion.',
        'reputation-death':
          '💔 Game Over - Your reputation was completely ruined.',
        bankruptcy: '💸 Game Over - You went bankrupt and had to close.',
      };

      const message = endReason ? messages[endReason] : 'Game Over';
      const score = gameState.score || 0;
      return `${message}\nFinal Score: ${score}`;
    }

    return `Turn ${displayDay(turn)}/${TOTAL_TURNS} - Money: $${resources.money} | Reputation: ${resources.reputation}% | Energy: ${resources.energy}%`;
  }

  static isValidChoice(scenario: Scenario, choiceId: string): boolean {
    return scenario.choices.some((choice) => choice.id === choiceId);
  }

  static isValidMenuOption(scenario: Scenario, menuOptionId: string): boolean {
    return scenario.menuOptions.some((option) => option.id === menuOptionId);
  }
}
