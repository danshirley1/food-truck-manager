"use strict";
/**
 * CLI display utilities for Food Truck Manager
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Display = void 0;
const helpers_1 = require("../utils/helpers");
const chalk_1 = __importDefault(require("chalk"));
class Display {
    /**
     * Clear the console screen
     */
    static clear() {
        console.clear();
    }
    /**
     * Format money with appropriate colors
     */
    static formatMoney(money) {
        let color = chalk_1.default.green;
        if (money < 20)
            color = chalk_1.default.redBright;
        else if (money < 50)
            color = chalk_1.default.yellow;
        return color(`💰 Money: $${money}`);
    }
    /**
     * Format reputation with appropriate colors
     */
    static formatReputation(reputation) {
        let color = chalk_1.default.green;
        if (reputation < 20)
            color = chalk_1.default.redBright;
        else if (reputation < 50)
            color = chalk_1.default.yellow;
        return color(`⭐ Reputation: ${reputation}%`);
    }
    /**
     * Format energy with appropriate colors
     */
    static formatEnergy(energy) {
        let color = chalk_1.default.green;
        if (energy < 20)
            color = chalk_1.default.redBright;
        else if (energy < 50)
            color = chalk_1.default.yellow;
        return color(`⚡ Energy: ${energy}%`);
    }
    /**
     * Show compact stats bar (always visible)
     */
    static showStatsBar(gameState) {
        const { resources, turn } = gameState;
        const dayText = chalk_1.default.hex('#FFA500')(`Day ${turn.toString().padStart(2)}/15`);
        const moneyText = this.formatMoney(resources.money);
        const repText = this.formatReputation(resources.reputation);
        const energyText = this.formatEnergy(resources.energy);
        // Simple pipe-separated format
        console.log(dayText + chalk_1.default.gray(' | ') + moneyText + chalk_1.default.gray(' | ') + repText + chalk_1.default.gray(' | ') + energyText);
        console.log(chalk_1.default.gray('─'.repeat(65))); // Simple separator line
    }
    /**
     * Display game title and branding
     */
    static showTitle() {
        console.log(chalk_1.default.cyan.bold('🚚 FOOD TRUCK MANAGER 🚚'));
        console.log(chalk_1.default.cyan('========================'));
        console.log(chalk_1.default.white('Manage your food truck through 15 days of business!'));
        console.log(chalk_1.default.gray('Make smart decisions to keep your money, reputation, and energy balanced.\n'));
    }
    /**
     * Display current game status
     */
    static showGameStatus(gameState) {
        const { resources, turn } = gameState;
        console.log(chalk_1.default.blue.bold(`\n📊 Day ${turn}/15 Status:`));
        console.log(chalk_1.default.gray('─'.repeat(40)));
        console.log(this.formatMoney(resources.money));
        console.log(this.formatReputation(resources.reputation));
        console.log(this.formatEnergy(resources.energy));
        console.log(chalk_1.default.gray('─'.repeat(40)));
    }
    /**
     * Display a scenario with choices
     */
    static showScenario(scenario) {
        console.log(chalk_1.default.yellow.bold(`\n🎯 ${scenario.title}`));
        console.log(chalk_1.default.yellow('─'.repeat(scenario.title.length + 4)));
        console.log(chalk_1.default.white(`${scenario.text}\n`));
        console.log(chalk_1.default.cyan.bold('Your options:'));
        scenario.choices.forEach((choice, index) => {
            const effects = this.formatEffects(choice.effects);
            const effectsText = effects ? ` ${effects}` : '';
            console.log(chalk_1.default.white(`${index + 1}. ${choice.label}`) + chalk_1.default.dim(effectsText));
        });
    }
    /**
     * Format resource effects for display
     */
    static formatEffects(effects) {
        const parts = [];
        if (effects.money) {
            const sign = effects.money > 0 ? '+' : '';
            const color = effects.money > 0 ? chalk_1.default.green : chalk_1.default.redBright;
            parts.push(color(`💰${sign}$${effects.money}`));
        }
        if (effects.reputation) {
            const change = (0, helpers_1.formatResourceChange)(effects.reputation);
            if (change) {
                const color = effects.reputation > 0 ? chalk_1.default.green : chalk_1.default.redBright;
                parts.push(color(`⭐${change}%`));
            }
        }
        if (effects.energy) {
            const change = (0, helpers_1.formatResourceChange)(effects.energy);
            if (change) {
                const color = effects.energy > 0 ? chalk_1.default.green : chalk_1.default.redBright;
                parts.push(color(`⚡${change}%`));
            }
        }
        return parts.length > 0 ? `(${parts.join(', ')})` : '';
    }
    /**
     * Show choice result
     */
    static showChoiceResult(choice, resourcesBefore, resourcesAfter) {
        console.log(chalk_1.default.green.bold(`\n✅ You chose: ${choice.label}`));
        // Show resource changes
        const changes = [];
        if (choice.effects.money) {
            const change = (0, helpers_1.formatResourceChange)(choice.effects.money);
            const changeColor = choice.effects.money > 0 ? chalk_1.default.green : chalk_1.default.redBright;
            changes.push(`💰 Money: $${resourcesBefore.money} → $${resourcesAfter.money} ${changeColor(`(${change})`)}`);
        }
        if (choice.effects.reputation) {
            const change = (0, helpers_1.formatResourceChange)(choice.effects.reputation);
            const changeColor = choice.effects.reputation > 0 ? chalk_1.default.green : chalk_1.default.redBright;
            changes.push(`⭐ Reputation: ${resourcesBefore.reputation}% → ${resourcesAfter.reputation}% ${changeColor(`(${change})`)}`);
        }
        if (choice.effects.energy) {
            const change = (0, helpers_1.formatResourceChange)(choice.effects.energy);
            const changeColor = choice.effects.energy > 0 ? chalk_1.default.green : chalk_1.default.redBright;
            changes.push(`⚡ Energy: ${resourcesBefore.energy}% → ${resourcesAfter.energy}% ${changeColor(`(${change})`)}`);
        }
        if (changes.length > 0) {
            console.log(chalk_1.default.cyan('\nChanges:'));
            changes.forEach(change => console.log(`  ${change}`));
        }
    }
    /**
     * Display game over screen
     */
    static showGameOver(gameState) {
        console.log(chalk_1.default.gray('\n' + '='.repeat(50)));
        const { endReason, score, resources } = gameState;
        switch (endReason) {
            case 'victory':
                console.log(chalk_1.default.green.bold('🎉 CONGRATULATIONS! 🎉'));
                console.log(chalk_1.default.green('You successfully managed your food truck for 15 days!'));
                break;
            case 'burnout':
                console.log(chalk_1.default.red.bold('😴 GAME OVER - BURNOUT'));
                console.log(chalk_1.default.red('You collapsed from exhaustion. Running a food truck is tough work!'));
                break;
            case 'reputation-death':
                console.log(chalk_1.default.red.bold('💔 GAME OVER - REPUTATION RUINED'));
                console.log(chalk_1.default.red('Word spread about poor service. No customers want to visit your truck.'));
                break;
            case 'bankruptcy':
                console.log(chalk_1.default.red.bold('💸 GAME OVER - BANKRUPTCY'));
                console.log(chalk_1.default.red('You ran out of money and had to close down the business.'));
                break;
            default:
                console.log(chalk_1.default.red.bold('🏁 GAME OVER'));
        }
        console.log(chalk_1.default.cyan.bold('\nFinal Status:'));
        console.log(this.formatMoney(resources.money));
        console.log(this.formatReputation(resources.reputation));
        console.log(this.formatEnergy(resources.energy));
        if (score) {
            console.log(chalk_1.default.yellow.bold(`\n🏆 Final Score: ${score}`));
        }
        console.log(chalk_1.default.gray('='.repeat(50)));
    }
    /**
     * Display help information
     */
    static showHelp() {
        console.log(chalk_1.default.blue.bold('\n📖 HOW TO PLAY:'));
        console.log(chalk_1.default.blue('─'.repeat(20)));
        console.log(chalk_1.default.white('• Manage your food truck for 15 days'));
        console.log(chalk_1.default.white('• Balance three resources: Money, Reputation, Energy'));
        console.log(chalk_1.default.white('• Make choices that affect your business'));
        console.log(chalk_1.default.white('• Avoid running out of energy, reputation, or money'));
        console.log(chalk_1.default.white('• Survive all 15 days to win!'));
        console.log('');
        console.log(chalk_1.default.yellow.bold('💡 TIPS:'));
        console.log(chalk_1.default.gray('• Keep all resources balanced - don\'t neglect any one area'));
        console.log(chalk_1.default.gray('• Early days are easier, later days have bigger stakes'));
        console.log(chalk_1.default.gray('• Customer service matters for reputation'));
        console.log(chalk_1.default.gray('• Don\'t overwork yourself - manage your energy'));
        console.log(chalk_1.default.gray('• Sometimes spending money saves problems later'));
    }
    /**
     * Prompt for user input
     */
    static prompt(message) {
        process.stdout.write(`\n${message}: `);
    }
    /**
     * Display error message
     */
    static showError(message) {
        console.log(chalk_1.default.red.bold(`\n❌ ${message}`));
    }
    /**
     * Display loading message
     */
    static showLoading(message) {
        console.log(chalk_1.default.blue(`\n⏳ ${message}...`));
    }
    /**
     * Wait for user to press Enter
     */
    static async waitForEnter() {
        return new Promise((resolve) => {
            const stdin = process.stdin;
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding('utf8');
            const onData = (key) => {
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
exports.Display = Display;
//# sourceMappingURL=display.js.map