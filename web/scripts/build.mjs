#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'run-next.mjs');
spawn(process.execPath, [script, 'build'], { stdio: 'inherit' }).on('exit', (code) =>
  process.exit(code ?? 0)
);
