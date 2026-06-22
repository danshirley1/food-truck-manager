import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline';

import { evaluateClassification } from './huggingface';
import type { ModerationConfig, ModerationResult } from '../types';

type HfClassificationItem = {
  label: string;
  score: number;
};

let daemon: ChildProcessWithoutNullStreams | null = null;
let readyPromise: Promise<void> | null = null;
let responseQueue: Array<{
  resolve: (items: HfClassificationItem[]) => void;
  reject: (err: Error) => void;
}> = [];
let rl: readline.Interface | null = null;

function resolvePaths(config: ModerationConfig): {
  pythonBin: string;
  daemonScript: string;
  modelDir: string;
} {
  const repoRoot = path.resolve(process.cwd(), '..');
  const mlRoot = path.join(repoRoot, 'ml', 'text-moderation');

  return {
    pythonBin:
      process.env.LOCAL_MODERATION_PYTHON ??
      path.join(mlRoot, '.venv', 'bin', 'python'),
    daemonScript: path.join(mlRoot, 'infer_daemon.py'),
    modelDir:
      config.localModelPath ?? path.join(mlRoot, 'output', 'model'),
  };
}

function startDaemon(config: ModerationConfig): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = new Promise((resolve, reject) => {
    const { pythonBin, daemonScript, modelDir } = resolvePaths(config);

    daemon = spawn(pythonBin, [daemonScript, modelDir], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    rl = readline.createInterface({ input: daemon.stdout });

    const fail = (err: Error) => {
      readyPromise = null;
      reject(err);
    };

    daemon.stderr.on('data', (chunk) => {
      console.warn('[moderation:local-model]', chunk.toString());
    });

    daemon.on('error', fail);
    daemon.on('exit', (code) => {
      readyPromise = null;
      daemon = null;
      for (const { reject: rej } of responseQueue) {
        rej(new Error(`local-model daemon exited (${code})`));
      }
      responseQueue = [];
    });

    rl.on('line', (line) => {
      try {
        const parsed = JSON.parse(line) as
          | { ready?: boolean; error?: string }
          | HfClassificationItem[];

        if (!Array.isArray(parsed)) {
          if (parsed.error) {
            fail(new Error(parsed.error));
            return;
          }
          if (parsed.ready) {
            resolve();
          }
          return;
        }

        const handler = responseQueue.shift();
        if (handler) {
          handler.resolve(parsed);
        }
      } catch (err) {
        const handler = responseQueue.shift();
        if (handler) {
          handler.reject(err instanceof Error ? err : new Error(String(err)));
        }
      }
    });
  });

  return readyPromise;
}

async function classifyWithDaemon(
  text: string,
  config: ModerationConfig
): Promise<HfClassificationItem[]> {
  await startDaemon(config);
  if (!daemon?.stdin) {
    throw new Error('local-model daemon not running');
  }

  return new Promise((resolve, reject) => {
    responseQueue.push({ resolve, reject });
    daemon!.stdin.write(`${text}\n`);
  });
}

export async function moderateWithLocalModel(
  text: string,
  config: ModerationConfig
): Promise<ModerationResult | null> {
  try {
    const items = await classifyWithDaemon(text, config);
    return { ...evaluateClassification(items, config.threshold), provider: 'local-model' };
  } catch (err) {
    console.warn('[moderation:local-model] Inference failed:', err);
    return null;
  }
}
