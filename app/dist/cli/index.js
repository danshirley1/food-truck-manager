#!/usr/bin/env node
"use strict";
/**
 * CLI entry point for Food Truck Manager
 */
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("./game");
// Start the game
(0, game_1.startGame)().catch(error => {
    console.error('❌ Game crashed:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map