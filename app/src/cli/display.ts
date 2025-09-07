/**
 * CLI display utilities for Food Truck Manager
 */

import { GameState, Scenario, Choice, Resources } from '../types';
import { formatResourceChange } from '../utils/helpers';
import chalk from 'chalk';

export class Display {
  
  /**
   * Clear the console screen
   */
  static clear(): void {
    console.clear();
  }

  /**
   * Format money with appropriate colors
   */
  private static formatMoney(money: number): string {
    let color = chalk.green;
    if (money < 20) color = chalk.redBright;
    else if (money < 50) color = chalk.yellow;
    
    return color(`💰 Money: $${money}`);
  }

  /**
   * Format reputation with appropriate colors
   */
  private static formatReputation(reputation: number): string {
    let color = chalk.green;
    if (reputation < 20) color = chalk.redBright;
    else if (reputation < 50) color = chalk.yellow;
    
    return color(`⭐ Reputation: ${reputation}%`);
  }

  /**
   * Format energy with appropriate colors
   */
  private static formatEnergy(energy: number): string {
    let color = chalk.green;
    if (energy < 20) color = chalk.redBright;
    else if (energy < 50) color = chalk.yellow;
    
    return color(`⚡ Energy: ${energy}%`);
  }

  /**
   * Show compact stats bar (always visible)
   */
  static showStatsBar(gameState: GameState): void {
    const { resources, turn } = gameState;
    
    const dayText = chalk.hex('#FFA500')(`Day ${turn.toString().padStart(2)}/15`);
    const moneyText = this.formatMoney(resources.money);
    const repText = this.formatReputation(resources.reputation);
    const energyText = this.formatEnergy(resources.energy);
    
    // Simple pipe-separated format
    console.log(dayText + chalk.gray(' | ') + moneyText + chalk.gray(' | ') + repText + chalk.gray(' | ') + energyText);
    console.log(chalk.gray('─'.repeat(65))); // Simple separator line
  }

  /**
   * Display game title and branding
   */
  static showTitle(): void {
    console.log(chalk.cyan.bold('🚚 FOOD TRUCK MANAGER 🚚'));
    console.log(chalk.cyan('========================'));
    console.log(chalk.white('Manage your food truck through 15 days of business!'));
    console.log(chalk.gray('Make smart decisions to keep your money, reputation, and energy balanced.\n'));
  }

  /**
   * Display current game status
   */
  static showGameStatus(gameState: GameState): void {
    const { resources, turn } = gameState;
    
    console.log(chalk.blue.bold(`\n📊 Day ${turn}/15 Status:`));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(this.formatMoney(resources.money));
    console.log(this.formatReputation(resources.reputation));
    console.log(this.formatEnergy(resources.energy));
    console.log(chalk.gray('─'.repeat(40)));
  }

  /**
   * Display a scenario with choices
   */
  static showScenario(scenario: Scenario): void {
    console.log(chalk.yellow.bold(`\n🎯 ${scenario.title}`));
    console.log(chalk.yellow('─'.repeat(scenario.title.length + 4)));
    console.log(chalk.white(`${scenario.text}\n`));
    
    console.log(chalk.cyan.bold('Your options:'));
    scenario.choices.forEach((choice, index) => {
      const effects = this.formatEffects(choice.effects);
      const effectsText = effects ? ` ${effects}` : '';
      console.log(chalk.white(`${index + 1}. ${choice.label}`) + chalk.dim(effectsText));
    });
  }

  /**
   * Format resource effects for display
   */
  private static formatEffects(effects: any): string {
    const parts: string[] = [];
    
    if (effects.money) {
      const sign = effects.money > 0 ? '+' : '';
      const color = effects.money > 0 ? chalk.green : chalk.redBright;
      parts.push(color(`💰${sign}$${effects.money}`));
    }
    
    if (effects.reputation) {
      const change = formatResourceChange(effects.reputation);
      if (change) {
        const color = effects.reputation > 0 ? chalk.green : chalk.redBright;
        parts.push(color(`⭐${change}%`));
      }
    }
    
    if (effects.energy) {
      const change = formatResourceChange(effects.energy);
      if (change) {
        const color = effects.energy > 0 ? chalk.green : chalk.redBright;
        parts.push(color(`⚡${change}%`));
      }
    }
    
    return parts.length > 0 ? `(${parts.join(', ')})` : '';
  }

  /**
   * Show choice result
   */
  static showChoiceResult(choice: Choice, resourcesBefore: Resources, resourcesAfter: Resources): void {
    console.log(chalk.green.bold(`\n✅ You chose: ${choice.label}`));
    
    // Show resource changes
    const changes: string[] = [];
    
    if (choice.effects.money) {
      const change = formatResourceChange(choice.effects.money);
      const changeColor = choice.effects.money > 0 ? chalk.green : chalk.redBright;
      changes.push(`💰 Money: $${resourcesBefore.money} → $${resourcesAfter.money} ${changeColor(`(${change})`)}`); 
    }
    
    if (choice.effects.reputation) {
      const change = formatResourceChange(choice.effects.reputation);
      const changeColor = choice.effects.reputation > 0 ? chalk.green : chalk.redBright;
      changes.push(`⭐ Reputation: ${resourcesBefore.reputation}% → ${resourcesAfter.reputation}% ${changeColor(`(${change})`)}`); 
    }
    
    if (choice.effects.energy) {
      const change = formatResourceChange(choice.effects.energy);
      const changeColor = choice.effects.energy > 0 ? chalk.green : chalk.redBright;
      changes.push(`⚡ Energy: ${resourcesBefore.energy}% → ${resourcesAfter.energy}% ${changeColor(`(${change})`)}`); 
    }
    
    if (changes.length > 0) {
      console.log(chalk.cyan('\nChanges:'));
      changes.forEach(change => console.log(`  ${change}`));
    }
  }

  /**
   * Display game over screen
   */
  static showGameOver(gameState: GameState): void {
    console.log(chalk.gray('\n' + '='.repeat(50)));
    
    const { endReason, score, resources } = gameState;
    
    switch (endReason) {
      case 'victory':
        console.log(chalk.green.bold('🎉 CONGRATULATIONS! 🎉'));
        console.log(chalk.green('You successfully managed your food truck for 15 days!'));
        break;
      case 'burnout':
        console.log(chalk.red.bold('😴 GAME OVER - BURNOUT'));
        console.log(chalk.red('You collapsed from exhaustion. Running a food truck is tough work!'));
        break;
      case 'reputation-death':
        console.log(chalk.red.bold('💔 GAME OVER - REPUTATION RUINED'));
        console.log(chalk.red('Word spread about poor service. No customers want to visit your truck.'));
        break;
      case 'bankruptcy':
        console.log(chalk.red.bold('💸 GAME OVER - BANKRUPTCY'));
        console.log(chalk.red('You ran out of money and had to close down the business.'));
        break;
      default:
        console.log(chalk.red.bold('🏁 GAME OVER'));
    }
    
    console.log(chalk.cyan.bold('\nFinal Status:'));
    console.log(this.formatMoney(resources.money));
    console.log(this.formatReputation(resources.reputation));
    console.log(this.formatEnergy(resources.energy));
    
    if (score) {
      console.log(chalk.yellow.bold(`\n🏆 Final Score: ${score}`));
    }
    
    console.log(chalk.gray('='.repeat(50)));
  }

  /**
   * Display help information
   */
  static showHelp(): void {
    console.log(chalk.blue.bold('\n📖 HOW TO PLAY:'));
    console.log(chalk.blue('─'.repeat(20)));
    console.log(chalk.white('• Manage your food truck for 15 days'));
    console.log(chalk.white('• Balance three resources: Money, Reputation, Energy'));
    console.log(chalk.white('• Make choices that affect your business'));
    console.log(chalk.white('• Avoid running out of energy, reputation, or money'));
    console.log(chalk.white('• Survive all 15 days to win!'));
    console.log('');
    console.log(chalk.yellow.bold('💡 TIPS:'));
    console.log(chalk.gray('• Keep all resources balanced - don\'t neglect any one area'));
    console.log(chalk.gray('• Early days are easier, later days have bigger stakes'));
    console.log(chalk.gray('• Customer service matters for reputation'));
    console.log(chalk.gray('• Don\'t overwork yourself - manage your energy'));
    console.log(chalk.gray('• Sometimes spending money saves problems later'));
  }

  /**
   * Prompt for user input
   */
  static prompt(message: string): void {
    process.stdout.write(`\n${message}: `);
  }

  /**
   * Display error message
   */
  static showError(message: string): void {
    console.log(chalk.red.bold(`\n❌ ${message}`));
  }

  /**
   * Display loading message
   */
  static showLoading(message: string): void {
    console.log(chalk.blue(`\n⏳ ${message}...`));
  }

  /**
   * Wait for user to press Enter
   */
  static async waitForEnter(): Promise<void> {
    return new Promise((resolve) => {
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');
      
      const onData = (key: string) => {
        if (key === '\r' || key === '\n') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();
          console.log('');
          resolve();
        }
      };
      
      stdin.on('data', onData);
      this.prompt('Press Enter to continue');
    });
  }
}