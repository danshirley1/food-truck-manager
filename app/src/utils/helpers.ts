/**
 * Utility functions for Food Truck Manager
 */

import { randomBytes } from 'crypto';

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generate a unique identifier
 */
export function generateId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * Get a random element from an array
 */
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
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
export function formatMoney(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}$${absAmount}`;
}

/**
 * Format a resource change for display
 */
export function formatResourceChange(change: number): string {
  if (change === 0) return '';
  return change > 0 ? `+${change}` : `${change}`;
}

/**
 * Simple seeded random number generator
 * Used for deterministic scenario generation
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashCode(seed);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}