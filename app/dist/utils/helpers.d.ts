/**
 * Utility functions for Food Truck Manager
 */
/**
 * Clamp a number between min and max values
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Generate a unique identifier
 */
export declare function generateId(): string;
/**
 * Get a random element from an array
 */
export declare function randomChoice<T>(array: T[]): T;
/**
 * Shuffle an array in place using Fisher-Yates algorithm
 */
export declare function shuffle<T>(array: T[]): T[];
/**
 * Format money amount with appropriate sign and symbol
 */
export declare function formatMoney(amount: number): string;
/**
 * Format a resource change for display
 */
export declare function formatResourceChange(change: number): string;
/**
 * Simple seeded random number generator
 * Used for deterministic scenario generation
 */
export declare class SeededRandom {
    private seed;
    constructor(seed: string);
    private hashCode;
    next(): number;
    choice<T>(array: T[]): T;
}
//# sourceMappingURL=helpers.d.ts.map