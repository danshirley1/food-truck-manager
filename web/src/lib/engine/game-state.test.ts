import { describe, expect, it } from 'vitest';
import { GameStateManager } from './game-state';
import { TOTAL_TURNS } from '@/lib/types';
import {
  makeBusinessChoice,
  makeMenuOptions,
  makeScenario,
} from '@/test/fixtures';

describe('GameStateManager', () => {
  describe('createNew', () => {
    it('starts with default resources and turn 1', () => {
      const state = GameStateManager.createNew();

      expect(state.turn).toBe(1);
      expect(state.resources).toEqual({
        money: 100,
        reputation: 50,
        energy: 80,
      });
      expect(state.gameOver).toBe(false);
      expect(state.chefsKudos).toBe(0);
      expect(state.choiceHistory).toEqual([]);
    });

    it('supports lobby state at turn 0', () => {
      const state = GameStateManager.createNew(undefined, undefined, 0);
      expect(state.turn).toBe(0);
    });
  });

  describe('getCurrentDifficulty', () => {
    it('maps turns to early, mid, and late bands', () => {
      expect(GameStateManager.getCurrentDifficulty(1)).toBe('early');
      expect(GameStateManager.getCurrentDifficulty(2)).toBe('early');
      expect(GameStateManager.getCurrentDifficulty(3)).toBe('mid');
      expect(GameStateManager.getCurrentDifficulty(4)).toBe('mid');
      expect(GameStateManager.getCurrentDifficulty(5)).toBe('late');
    });
  });

  describe('applyTurn', () => {
    it('applies business and menu effects and advances the turn', () => {
      const state = GameStateManager.createNew();
      const scenario = makeScenario();
      const business = makeBusinessChoice();
      const menu = makeMenuOptions()[0];

      const next = GameStateManager.applyTurn(state, scenario, business, menu);

      expect(next.turn).toBe(2);
      expect(next.gameOver).toBe(false);
      expect(next.resources.money).toBeGreaterThan(state.resources.money);
      expect(next.chefsKudos).toBe(3);
      expect(next.choiceHistory).toHaveLength(1);
      expect(next.lastMenuFeedback).toMatchObject({
        turn: 1,
        menuLabel: menu.label,
        stars: 3,
      });
    });

    it('caps combined turn deltas to the configured maximum', () => {
      const state = GameStateManager.createNew();
      const scenario = makeScenario({
        choices: [
          {
            id: 'biz-big',
            label: 'Big spend',
            effects: { money: -20, reputation: -20, energy: -20 },
          },
        ],
        menuOptions: [
          {
            id: 'menu-big',
            label: 'Overload Bowl',
            description: 'An absurdly heavy bowl.',
            effects: { money: -20, reputation: -20, energy: -20 },
            verdictReason: 'Way too much for this crowd.',
          },
          {
            id: 'menu-mid',
            label: 'Okay Bowl',
            description: 'A middling bowl.',
            effects: { money: 0, reputation: 0, energy: -2 },
            verdictReason: 'Average fit.',
          },
          {
            id: 'menu-best',
            label: 'Light Bowl',
            description: 'A lighter bowl.',
            effects: { money: 8, reputation: 6, energy: -2 },
            verdictReason: 'Best fit.',
          },
        ],
      });

      const next = GameStateManager.applyTurn(
        state,
        scenario,
        scenario.choices[0],
        scenario.menuOptions[0]
      );

      const record = next.choiceHistory[0];
      const magnitude =
        Math.abs(record.effects.money ?? 0) +
        Math.abs(record.effects.reputation ?? 0) +
        Math.abs(record.effects.energy ?? 0);

      expect(magnitude).toBeLessThanOrEqual(30);
    });

    it('ends with victory after completing the final day', () => {
      let state = GameStateManager.createNew();
      const scenario = makeScenario();

      for (let day = 1; day <= TOTAL_TURNS; day++) {
        state = GameStateManager.applyTurn(
          state,
          { ...scenario, id: `scenario-${day}` },
          makeBusinessChoice(),
          makeMenuOptions()[1]
        );
      }

      expect(state.gameOver).toBe(true);
      expect(state.endReason).toBe('victory');
      expect(state.turn).toBe(TOTAL_TURNS);
      expect(state.score).toBeTypeOf('number');
    });

    it('ends with bankruptcy when money reaches zero', () => {
      const state = GameStateManager.createNew('session', undefined, 1);
      state.resources.money = 1;

      const scenario = makeScenario({
        choices: [
          {
            id: 'biz-broke',
            label: 'Close the till',
            effects: { money: -20, reputation: 0, energy: 0 },
          },
        ],
      });

      const next = GameStateManager.applyTurn(
        state,
        scenario,
        scenario.choices[0],
        makeMenuOptions()[2]
      );

      expect(next.gameOver).toBe(true);
      expect(next.endReason).toBe('bankruptcy');
      expect(next.resources.money).toBeLessThanOrEqual(0);
    });

    it('ends with burnout when energy reaches zero', () => {
      const state = GameStateManager.createNew();
      state.resources.energy = 1;

      const scenario = makeScenario({
        choices: [
          {
            id: 'biz-tired',
            label: 'Work through the night',
            effects: { money: 0, reputation: 0, energy: -20 },
          },
        ],
      });

      const next = GameStateManager.applyTurn(
        state,
        scenario,
        scenario.choices[0],
        makeMenuOptions()[2]
      );

      expect(next.gameOver).toBe(true);
      expect(next.endReason).toBe('burnout');
      expect(next.resources.energy).toBe(0);
    });
  });

  describe('validation helpers', () => {
    it('accepts valid business and menu ids', () => {
      const scenario = makeScenario();
      expect(GameStateManager.isValidChoice(scenario, 'biz-a')).toBe(true);
      expect(GameStateManager.isValidMenuOption(scenario, 'menu-best')).toBe(true);
      expect(GameStateManager.isValidChoice(scenario, 'missing')).toBe(false);
      expect(GameStateManager.isValidMenuOption(scenario, 'missing')).toBe(false);
    });
  });

  describe('getGameStatus', () => {
    it('formats in-progress and victory messages', () => {
      const playing = GameStateManager.createNew();
      expect(GameStateManager.getGameStatus(playing)).toContain('Turn 1/5');

      const won = GameStateManager.applyTurn(
        GameStateManager.createNew(),
        makeScenario(),
        makeBusinessChoice(),
        makeMenuOptions()[0]
      );
      won.gameOver = true;
      won.endReason = 'victory';
      won.score = 120;

      expect(GameStateManager.getGameStatus(won)).toContain('Victory');
      expect(GameStateManager.getGameStatus(won)).toContain('120');
    });
  });
});
