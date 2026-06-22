#!/usr/bin/env node
/**
 * Ensure native binaries exist for both darwin arm64 and x64 on macOS.
 * x64 Node (Rosetta) is common via nvm; npm often skips the wrong optional arch.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, '..');

function readPkgVersion(...segments) {
  const pkgPath = path.join(webRoot, 'node_modules', ...segments, 'package.json');
  return JSON.parse(readFileSync(pkgPath, 'utf8')).version;
}

/** @type {Array<{ name: string, version: string, marker: string }>} */
function darwinNativePackages() {
  const tailwindVersion = readPkgVersion('@tailwindcss', 'postcss');
  const rollupVersion = readPkgVersion('rollup');
  const esbuildVersion = readPkgVersion('esbuild');

  return [
    {
      name: 'lightningcss-darwin-arm64',
      version: '1.32.0',
      marker: 'lightningcss.darwin-arm64.node',
    },
    {
      name: 'lightningcss-darwin-x64',
      version: '1.32.0',
      marker: 'lightningcss.darwin-x64.node',
    },
    {
      name: '@tailwindcss/oxide-darwin-arm64',
      version: tailwindVersion,
      marker: 'tailwindcss-oxide.darwin-arm64.node',
    },
    {
      name: '@tailwindcss/oxide-darwin-x64',
      version: tailwindVersion,
      marker: 'tailwindcss-oxide.darwin-x64.node',
    },
    {
      name: '@rollup/rollup-darwin-arm64',
      version: rollupVersion,
      marker: 'rollup.darwin-arm64.node',
    },
    {
      name: '@rollup/rollup-darwin-x64',
      version: rollupVersion,
      marker: 'rollup.darwin-x64.node',
    },
    {
      name: '@esbuild/darwin-arm64',
      version: esbuildVersion,
      marker: path.join('bin', 'esbuild'),
    },
    {
      name: '@esbuild/darwin-x64',
      version: esbuildVersion,
      marker: path.join('bin', 'esbuild'),
    },
  ];
}

function ensurePackage(name, version, markerFile) {
  const targetDir = path.join(webRoot, 'node_modules', ...name.split('/'));
  const marker = path.join(targetDir, markerFile);

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
  for (const pkg of darwinNativePackages()) {
    ensurePackage(pkg.name, pkg.version, pkg.marker);
  }
}
