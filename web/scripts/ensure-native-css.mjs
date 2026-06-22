#!/usr/bin/env node
/**
 * Ensure Tailwind / lightningcss native binaries exist for both arm64 and x64 on macOS.
 * Webpack PostCSS workers may run as x64 (Rosetta) even when the parent process is arm64.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');

function readTailwindVersion() {
  const pkgPath = path.join(webRoot, 'node_modules', '@tailwindcss/postcss', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}

function ensurePackage(name, version) {
  const targetDir = path.join(webRoot, 'node_modules', ...name.split('/'));
  const marker =
    name.startsWith('@tailwindcss/oxide')
      ? path.join(targetDir, `tailwindcss-oxide.${name.includes('x64') ? 'darwin-x64' : 'darwin-arm64'}.node`)
      : path.join(targetDir, `lightningcss.${name.includes('x64') ? 'darwin-x64' : 'darwin-arm64'}.node`);

  if (existsSync(marker)) {
    return;
  }

  console.log(`[postinstall] Installing native binding: ${name}@${version}`);
  const tmp = path.join(tmpdir(), `ftm-native-${name.replace('/', '-')}`);
  mkdirSync(tmp, { recursive: true });
  const tarball = execSync(`npm pack ${name}@${version}`, { cwd: tmp, encoding: 'utf8' })
    .trim()
    .split('\n')
    .pop()
    .trim();
  mkdirSync(targetDir, { recursive: true });
  execSync(`tar -xzf ${JSON.stringify(path.join(tmp, tarball))} -C ${JSON.stringify(targetDir)} --strip-components=1`);
}

if (process.platform === 'darwin') {
  const tailwindVersion = readTailwindVersion();
  ensurePackage('lightningcss-darwin-arm64', '1.32.0');
  ensurePackage('lightningcss-darwin-x64', '1.32.0');
  ensurePackage('@tailwindcss/oxide-darwin-arm64', tailwindVersion);
  ensurePackage('@tailwindcss/oxide-darwin-x64', tailwindVersion);
}
