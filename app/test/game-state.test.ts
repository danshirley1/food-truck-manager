/**
 * Tests for game state management
 */

import { GameStateManager } from '../src/engine/game-state';
import { Choice, Scenario } from '../src/types';

describe('GameStateManager', () => {
  test('creates new game state with correct initial values', () => {
    const gameState = GameStateManager.createNew('test-session');
    
    expect(gameState.sessionId).toBe('test-session');
    expect(gameState.turn).toBe(0);
    expect(gameState.gameOver).toBe(false);
    expect(gameState.resources.money).toBe(100);
    expect(gameState.resources.reputation).toBe(50);
    expect(gameState.resources.energy).toBe(80);
    expect(gameState.choiceHistory).toHaveLength(0);
  });

  test('applies choice effects correctly', () => {
    const gameState = GameStateManager.createNew('test-session');
    
    const mockScenario: Scenario = {
      id: 'test-scenario',
      title: 'Test Scenario',
      text: 'A test scenario',
      choices: [
        {
          id: 'test-choice',
          label: 'Test Choice',
          effects: { money: 10, reputation: -5, energy: -3 }
        }
      ],
      tags: ['customer-service'],
      difficulty: 'early',
      createdBy: 'static'
    };

    const choice = mockScenario.choices[0];
    const newState = GameStateManager.applyChoice(gameState, mockScenario, choice);

    expect(newState.turn).toBe(1);
    expect(newState.resources.money).toBe(110);
    expect(newState.resources.reputation).toBe(45);
    expect(newState.resources.energy).toBe(77);
    expect(newState.choiceHistory).toHaveLength(1);
  });

  test('enforces resource bounds', () => {
    const gameState = GameStateManager.createNew('test-session');
    gameState.resources.money = 990; // Near upper bound
    gameState.resources.reputation = 5; // Near lower bound
    gameState.resources.energy = 95; // Near upper bound

    const mockScenario: Scenario = {
      id: 'extreme-test',
      title: 'Extreme Test',
      text: 'Testing bounds',
      choices: [
        {
          id: 'extreme-choice',
          label: 'Extreme Choice',
          effects: { money: 20, reputation: -10, energy: 10 }
        }
      ],
      tags: ['crisis'],
      difficulty: 'late',
      createdBy: 'static'
    };

    const choice = mockScenario.choices[0];
    const newState = GameStateManager.applyChoice(gameState, mockScenario, choice);

    expect(newState.resources.money).toBe(999); // Clamped to max
    expect(newState.resources.reputation).toBe(0); // Clamped to min
    expect(newState.resources.energy).toBe(100); // Clamped to max
  });

  test('detects game over conditions', () => {
    // Test burnout
    const gameState1 = GameStateManager.createNew('test-session');
    gameState1.resources.energy = 5;
    
    const mockScenario: Scenario = {
      id: 'burnout-test',
      title: 'Burnout Test',
      text: 'Testing burnout',
      choices: [
        {
          id: 'burnout-choice',
          label: 'Exhausting Choice',
          effects: { energy: -10 }
        }
      ],
      tags: ['crisis'],
      difficulty: 'mid',
      createdBy: 'static'
    };

    const newState1 = GameStateManager.applyChoice(gameState1, mockScenario, mockScenario.choices[0]);
    expect(newState1.gameOver).toBe(true);
    expect(newState1.endReason).toBe('burnout');

    // Test victory condition
    const gameState2 = GameStateManager.createNew('test-session');
    gameState2.turn = 14; // Turn 14, next turn will be 15
    
    const victoryScenario: Scenario = {
      id: 'victory-test',
      title: 'Victory Test', 
      text: 'Final turn',
      choices: [
        {
          id: 'victory-choice',
          label: 'Final Choice',
          effects: { money: 5 }
        }
      ],
      tags: ['expansion'],
      difficulty: 'late',
      createdBy: 'static'
    };

    const victoryState = GameStateManager.applyChoice(gameState2, victoryScenario, victoryScenario.choices[0]);
    expect(victoryState.gameOver).toBe(true);
    expect(victoryState.endReason).toBe('victory');
    expect(victoryState.score).toBeGreaterThan(0);
  });

  test('getCurrentDifficulty returns correct levels', () => {
    expect(GameStateManager.getCurrentDifficulty(1)).toBe('early');
    expect(GameStateManager.getCurrentDifficulty(5)).toBe('early');
    expect(GameStateManager.getCurrentDifficulty(6)).toBe('mid');
    expect(GameStateManager.getCurrentDifficulty(10)).toBe('mid');
    expect(GameStateManager.getCurrentDifficulty(11)).toBe('late');
    expect(GameStateManager.getCurrentDifficulty(15)).toBe('late');
  });
});