#!/usr/bin/env node
/** Fail fast if deploy would push stale git (Heroku builds from commits, not working tree). */
import { execSync } from 'node:child_process';

const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
if (status) {
  console.error('Deploy blocked: you have uncommitted changes.\n');
  console.error(status);
  console.error('\nHeroku builds from committed `main`, not your working tree.');
  console.error('Commit (or stash) first, then run: npm run deploy');
  process.exit(1);
}

const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
if (branch !== 'main') {
  console.warn(`Warning: current branch is "${branch}", deploy pushes local main → Heroku.`);
}

console.log('Git tree clean — OK to deploy.');
