"use strict";
/**
 * Game state management for Food Truck Manager
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStateManager = void 0;
const helpers_1 = require("../utils/helpers");
class GameStateManager {
    /**
     * Create a new game state with initial values
     */
    static createNew(sessionId, randomSeed) {
        const now = new Date();
        return {
            sessionId: sessionId || (0, helpers_1.generateId)(),
            turn: 0,
            resources: {
                money: 100, // Starting with some capital
                reputation: 50, // Neutral reputation
                energy: 80 // High energy to start
            },
            gameOver: false,
            createdAt: now,
            updatedAt: now,
            randomSeed,
            choiceHistory: [],
            achievements: []
        };
    }
    /**
     * Apply a player choice to the game state
     */
    static applyChoice(gameState, scenario, choice) {
        const resourcesBefore = { ...gameState.resources };
        // Apply resource effects with bounds checking
        const newResources = {
            money: (0, helpers_1.clamp)(resourcesBefore.money + (choice.effects.money || 0), -999, 999),
            reputation: (0, helpers_1.clamp)(resourcesBefore.reputation + (choice.effects.reputation || 0), 0, 100),
            energy: (0, helpers_1.clamp)(resourcesBefore.energy + (choice.effects.energy || 0), 0, 100)
        };
        // Create choice record
        const choiceRecord = {
            turn: gameState.turn + 1,
            scenarioId: scenario.id,
            choiceId: choice.id,
            effects: choice.effects,
            resourcesBefore,
            resourcesAfter: newResources,
            timestamp: new Date()
        };
        // Check for game end conditions
        const endCondition = this.checkEndConditions(newResources, gameState.turn + 1);
        // Calculate final score if game is ending
        let finalScore;
        if (endCondition.gameOver) {
            finalScore = this.calculateScore(newResources, gameState.turn + 1, choiceRecord);
        }
        return {
            ...gameState,
            turn: gameState.turn + 1,
            resources: newResources,
            gameOver: endCondition.gameOver,
            endReason: endCondition.endReason,
            score: finalScore,
            updatedAt: new Date(),
            choiceHistory: [...gameState.choiceHistory, choiceRecord]
        };
    }
    /**
     * Check if game should end based on current state
     */
    static checkEndConditions(resources, turn) {
        // Failure conditions
        if (resources.energy <= 0) {
            return { gameOver: true, endReason: 'burnout' };
        }
        if (resources.reputation <= 0) {
            return { gameOver: true, endReason: 'reputation-death' };
        }
        if (resources.money <= -500) {
            return { gameOver: true, endReason: 'bankruptcy' };
        }
        // Victory condition - completed all 15 turns
        if (turn >= 15) {
            return { gameOver: true, endReason: 'victory' };
        }
        return { gameOver: false };
    }
    /**
     * Calculate final score based on resources and performance
     */
    static calculateScore(resources, turnsCompleted, lastChoice) {
        // Base score from resources (weighted by importance)
        const baseScore = (resources.money * 0.4) +
            (resources.reputation * 0.8) +
            (resources.energy * 0.6);
        // Turn completion bonus
        const turnBonus = turnsCompleted * 10;
        // Balanced finish multiplier
        let multiplier = 1.0;
        const minResource = Math.min(resources.money, resources.reputation, resources.energy);
        if (minResource >= 70) {
            multiplier = 1.5; // Excellence finish
        }
        else if (minResource >= 40) {
            multiplier = 1.2; // Balanced finish
        }
        return Math.round((baseScore + turnBonus) * multiplier);
    }
    /**
     * Get current difficulty level based on turn number
     */
    static getCurrentDifficulty(turn) {
        if (turn <= 5)
            return 'early';
        if (turn <= 10)
            return 'mid';
        return 'late';
    }
    /**
     * Get formatted game status for display
     */
    static getGameStatus(gameState) {
        const { resources, turn, gameOver, endReason } = gameState;
        if (gameOver) {
            const messages = {
                victory: "🎉 Victory! You successfully managed your food truck for 15 days!",
                burnout: "😴 Game Over - You burned out from exhaustion.",
                'reputation-death': "💔 Game Over - Your reputation was completely ruined.",
                bankruptcy: "💸 Game Over - You went bankrupt and had to close."
            };
            const message = endReason ? messages[endReason] : "Game Over";
            const score = gameState.score || 0;
            return `${message}\nFinal Score: ${score}`;
        }
        return `Turn ${turn}/15 - Money: $${resources.money} | Reputation: ${resources.reputation}% | Energy: ${resources.energy}%`;
    }
    /**
     * Validate that a choice is valid for the given scenario
     */
    static isValidChoice(scenario, choiceId) {
        return scenario.choices.some(choice => choice.id === choiceId);
    }
}
exports.GameStateManager = GameStateManager;
//# sourceMappingURL=game-state.js.map