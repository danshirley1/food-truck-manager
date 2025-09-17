/**
 * CLI input handling for Food Truck Manager
 */

import * as readline from 'readline';
import chalk from 'chalk';

export class Input {
  private static rl: readline.Interface | null = null;

  /**
   * Initialize readline interface
   */
  static init(): void {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
  }

  /**
   * Clean up readline interface
   */
  static cleanup(): void {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  /**
   * Ask a question and wait for user input
   */
  static async ask(question: string): Promise<string> {
    return new Promise((resolve) => {
      // Create a fresh readline interface for each question
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false  // Disable terminal mode to prevent double input
      });
      
      rl.question(question, (answer: string) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  /**
   * Ask for a number within a valid range
   */
  static async askNumber(
    question: string, 
    min: number, 
    max: number,
    retryMessage: string = 'Please enter a valid number'
  ): Promise<number> {
    while (true) {
      const answer = await this.ask(question);
      const num = parseInt(answer, 10);
      
      if (!isNaN(num) && num >= min && num <= max) {
        return num;
      }
      
      console.log(chalk.redBright(`❌ ${retryMessage} (${min}-${max}).`));
    }
  }

  /**
   * Ask for choice selection from a scenario
   */
  static async askChoice(choiceCount: number): Promise<number> {
    const question = chalk.cyan.bold(`\nEnter your choice (1-${choiceCount}): `);
    const retryMessage = `Please enter a number between 1 and ${choiceCount}`;
    
    return await this.askNumber(question, 1, choiceCount, retryMessage);
  }

  /**
   * Ask yes/no question
   */
  static async askYesNo(question: string, defaultValue: boolean = false): Promise<boolean> {
    const defaultText = defaultValue ? '[Y/n]' : '[y/N]';
    const fullQuestion = `${question} ${defaultText}: `;
    
    const answer = await this.ask(fullQuestion);
    
    if (answer === '') {
      return defaultValue;
    }
    
    const normalized = answer.toLowerCase();
    return normalized === 'y' || normalized === 'yes';
  }

  /**
   * Show menu and get selection
   */
  static async showMenu(title: string, options: string[]): Promise<number> {
    console.log(`\n${title}`);
    console.log('─'.repeat(title.length));
    
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    
    return await this.askNumber(
      `\nSelect an option (1-${options.length}): `,
      1,
      options.length,
      `Please select a valid option`
    );
  }

  /**
   * Wait for any key press
   */
  static async waitForKey(message: string = 'Press any key to continue'): Promise<void> {
    await this.ask(chalk.dim(`\n${message} (press Enter): `));
  }

  /**
   * Confirm before quitting
   */
  static async confirmQuit(): Promise<boolean> {
    return await this.askYesNo('Are you sure you want to quit?', false);
  }
}