"use strict";
/**
 * Utility functions for Food Truck Manager
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeededRandom = void 0;
exports.clamp = clamp;
exports.generateId = generateId;
exports.randomChoice = randomChoice;
exports.shuffle = shuffle;
exports.formatMoney = formatMoney;
exports.formatResourceChange = formatResourceChange;
const crypto_1 = require("crypto");
/**
 * Clamp a number between min and max values
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/**
 * Generate a unique identifier
 */
function generateId() {
    return (0, crypto_1.randomBytes)(8).toString('hex');
}
/**
 * Get a random element from an array
 */
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}
/**
 * Shuffle an array in place using Fisher-Yates algorithm
 */
function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
/**
 * Format money amount with appropriate sign and symbol
 */
function formatMoney(amount) {
    const absAmount = Math.abs(amount);
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${absAmount}`;
}
/**
 * Format a resource change for display
 */
function formatResourceChange(change) {
    if (change === 0)
        return '';
    return change > 0 ? `+${change}` : `${change}`;
}
/**
 * Simple seeded random number generator
 * Used for deterministic scenario generation
 */
class SeededRandom {
    constructor(seed) {
        this.seed = this.hashCode(seed);
    }
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
    choice(array) {
        return array[Math.floor(this.next() * array.length)];
    }
}
exports.SeededRandom = SeededRandom;
//# sourceMappingURL=helpers.js.map