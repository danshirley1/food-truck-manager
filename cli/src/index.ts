#!/usr/bin/env node

/**
 * CLI entry point for Food Truck Manager
 */

import { startGame } from './game';

// Start the game
startGame().catch(error => {
  console.error('❌ Game crashed:', error);
  process.exit(1);
});