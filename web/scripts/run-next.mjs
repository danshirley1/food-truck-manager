#!/usr/bin/env node
/**
 * Run Next.js CLI. Native CSS bindings for both darwin arm64/x64 are installed via
 * postinstall (ensure-native-deps.mjs) — no arch switching needed.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');
const nextEntry = path.join(webRoot, 'node_modules', 'next', 'dist', 'bin', 'next');

const mode = process.argv[2] ?? 'dev';
if (!['dev', 'build'].includes(mode)) {
  console.error(`Usage: node scripts/run-next.mjs <dev|build>`);
  process.exit(1);
}

function nativeCssReady() {
  if (process.platform !== 'darwin') return true;
  const arch = process.arch === 'x64' ? 'darwin-x64' : 'darwin-arm64';
  return (
    existsSync(
      path.join(webRoot, 'node_modules', `lightningcss-${arch}`, `lightningcss.${arch}.node`)
    ) &&
    existsSync(
      path.join(
        webRoot,
        'node_modules',
        `@tailwindcss/oxide-${arch}`,
        `tailwindcss-oxide.${arch}.node`
      )
    )
  );
}

if (!nativeCssReady()) {
  console.error(
    `[next] Missing Tailwind/lightningcss native modules for ${process.arch}. Run:\n` +
      `  node scripts/ensure-native-deps.mjs`
  );
  process.exit(1);
}

const child = spawn(process.execPath, [nextEntry, mode], {
  cwd: webRoot,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
