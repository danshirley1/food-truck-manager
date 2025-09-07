"use strict";
/**
 * CLI input handling for Food Truck Manager
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const readline = __importStar(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
class Input {
    /**
     * Initialize readline interface
     */
    static init() {
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
    static cleanup() {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
    }
    /**
     * Ask a question and wait for user input
     */
    static async ask(question) {
        return new Promise((resolve) => {
            // Create a fresh readline interface for each question
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: false // Disable terminal mode to prevent double input
            });
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }
    /**
     * Ask for a number within a valid range
     */
    static async askNumber(question, min, max, retryMessage = 'Please enter a valid number') {
        while (true) {
            const answer = await this.ask(question);
            const num = parseInt(answer, 10);
            if (!isNaN(num) && num >= min && num <= max) {
                return num;
            }
            console.log(chalk_1.default.redBright(`❌ ${retryMessage} (${min}-${max}).`));
        }
    }
    /**
     * Ask for choice selection from a scenario
     */
    static async askChoice(choiceCount) {
        const question = chalk_1.default.cyan.bold(`\nEnter your choice (1-${choiceCount}): `);
        const retryMessage = `Please enter a number between 1 and ${choiceCount}`;
        return await this.askNumber(question, 1, choiceCount, retryMessage);
    }
    /**
     * Ask yes/no question
     */
    static async askYesNo(question, defaultValue = false) {
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
    static async showMenu(title, options) {
        console.log(`\n${title}`);
        console.log('─'.repeat(title.length));
        options.forEach((option, index) => {
            console.log(`${index + 1}. ${option}`);
        });
        return await this.askNumber(`\nSelect an option (1-${options.length}): `, 1, options.length, `Please select a valid option`);
    }
    /**
     * Wait for any key press
     */
    static async waitForKey(message = 'Press any key to continue') {
        await this.ask(chalk_1.default.dim(`\n${message} (press Enter): `));
    }
    /**
     * Confirm before quitting
     */
    static async confirmQuit() {
        return await this.askYesNo('Are you sure you want to quit?', false);
    }
}
exports.Input = Input;
Input.rl = null;
//# sourceMappingURL=input.js.map