/**
 * CLI input handling for Food Truck Manager
 */
export declare class Input {
    private static rl;
    /**
     * Initialize readline interface
     */
    static init(): void;
    /**
     * Clean up readline interface
     */
    static cleanup(): void;
    /**
     * Ask a question and wait for user input
     */
    static ask(question: string): Promise<string>;
    /**
     * Ask for a number within a valid range
     */
    static askNumber(question: string, min: number, max: number, retryMessage?: string): Promise<number>;
    /**
     * Ask for choice selection from a scenario
     */
    static askChoice(choiceCount: number): Promise<number>;
    /**
     * Ask yes/no question
     */
    static askYesNo(question: string, defaultValue?: boolean): Promise<boolean>;
    /**
     * Show menu and get selection
     */
    static showMenu(title: string, options: string[]): Promise<number>;
    /**
     * Wait for any key press
     */
    static waitForKey(message?: string): Promise<void>;
    /**
     * Confirm before quitting
     */
    static confirmQuit(): Promise<boolean>;
}
//# sourceMappingURL=input.d.ts.map